describe('Workflow Execution and CompL Monitoring', () => {

  beforeEach(() => {
    cy.visit('/path/to/workflow/execution/page'); // Adjust URL

    // Mock API calls if needed (e.g., for starting workflows, getting status)
    cy.intercept('POST', '/api/workflows/start', { statusCode: 202, body: { workflowId: 'wf-123' } }).as('startWorkflow');
    // Mock status to stay 'RUNNING' longer for state checks, then 'COMPLETED'
    let statusCallCount = 0;
    cy.intercept('GET', '/api/workflows/wf-123/status', (req) => {
        statusCallCount++;
        const status = statusCallCount < 4 ? 'RUNNING' : 'COMPLETED';
        req.reply({ statusCode: 200, body: { status: status, result: status === 'COMPLETED' ? 'Success' : null } });
    }).as('getWorkflowStatus');

    // Mock real-time RAM usage endpoint (if polled) - adjust URL
    // This mock simulates fluctuating RAM usage during the workflow
    let ramUsage = 500; // Initial RAM in MB
    cy.intercept('GET', '/api/metrics/realtime', (req) => {
      ramUsage += (Math.random() - 0.4) * 100; // Fluctuate RAM
      ramUsage = Math.max(200, Math.min(4096, ramUsage)); // Keep within bounds (200MB - 4GB)
      req.reply({
        statusCode: 200,
        body: {
          timestamp: Date.now(),
          ramUsageMB: ramUsage,
          // Add other CompL metrics if displayed (CPU, VRAM)
        }
      });
    }).as('getRealtimeMetrics');

    // Mock for Agent States (Polling Example)
    let agentStates = { // Initial states
        'PlannerAgent': { status: 'Idle', details: '' },
        'ExecutorAgent_Simple': { status: 'Idle', details: '' },
        'ExecutorAgent_Complex': { status: 'Idle', details: '' }
    };
    let stateUpdateCount = 0;
    cy.intercept('GET', '/api/agents/states', (req) => {
        stateUpdateCount++;
        // Simulate state changes based on workflow progress
        if (stateUpdateCount === 1) { // After start
            agentStates['PlannerAgent'] = { status: 'Thinking', details: 'Planning steps...' };
        } else if (stateUpdateCount === 2) { // Planner delegates
            agentStates['PlannerAgent'] = { status: 'Waiting', details: 'Waiting for Executor' };
            // Update state based on which executor is configured (needs access to test config)
            // This simple mock updates one executor, adapt if needed
            agentStates['ExecutorAgent_Simple'] = { status: 'Running', details: 'Executing step 1' };
            agentStates['ExecutorAgent_Complex'] = { status: 'Running', details: 'Executing complex step A' };
        } else if (stateUpdateCount >= 3) { // Executor finishes
             agentStates['PlannerAgent'] = { status: 'Processing', details: 'Processing results' };
             agentStates['ExecutorAgent_Simple'] = { status: 'Completed', details: 'Finished execution' };
             agentStates['ExecutorAgent_Complex'] = { status: 'Completed', details: 'Finished complex execution' };
        }
         // Reset states if workflow completes in mock
        if (statusCallCount >= 4) {
             agentStates = {
                 'PlannerAgent': { status: 'Idle', details: '' },
                 'ExecutorAgent_Simple': { status: 'Idle', details: '' },
                 'ExecutorAgent_Complex': { status: 'Idle', details: '' }
             };
             stateUpdateCount = 0; // Reset for next potential run
        }

        req.reply({
            statusCode: 200,
            body: agentStates
        });
    }).as('getAgentStates');

    // New mock for quantization communication metrics
    cy.intercept('GET', '/api/metrics/quantization-impact', (req) => {
      const { sourceAgent, targetAgent, messageType, messageSize } = req.query;
      
      // Calculate metrics based on agent quantization levels
      // These calculations simulate the impact of different quantization levels on communication
      const sourceIsQ4 = sourceAgent?.includes('Q4') || false;
      const targetIsQ4 = targetAgent?.includes('Q4') || false;
      
      let latency, accuracy, vramSaved;
      
      // Simulate accuracy loss vs. speed gain with Q4
      if (sourceIsQ4 && targetIsQ4) {
        // Q4 → Q4 communication: Fast but less accurate
        latency = Math.random() * 50 + 100; // 100-150ms
        accuracy = Math.random() * 0.1 + 0.75; // 75-85%
        vramSaved = Math.random() * 200 + 700; // 700-900MB
      } else if (!sourceIsQ4 && !targetIsQ4) {
        // Q8 → Q8 communication: Slower but more accurate
        latency = Math.random() * 100 + 200; // 200-300ms
        accuracy = Math.random() * 0.05 + 0.92; // 92-97%
        vramSaved = 0; // Baseline
      } else {
        // Mixed Q4/Q8 communication: Compromise
        latency = Math.random() * 75 + 150; // 150-225ms
        accuracy = Math.random() * 0.07 + 0.85; // 85-92%
        vramSaved = Math.random() * 100 + 300; // 300-400MB
      }
      
      // Calculate communication overhead based on message size and type
      const msgSize = parseInt(messageSize || '1000', 10);
      const overhead = msgSize * (messageType === 'complex' ? 0.25 : 0.1);
      
      req.reply({
        statusCode: 200,
        body: {
          metrics: {
            latency: latency,
            accuracy: accuracy,
            vramSaved: vramSaved,
            communicationOverhead: overhead,
            throughputKBps: Math.random() * 500 + 1000, // 1000-1500 KB/s
            tokenizationEfficiency: sourceIsQ4 === targetIsQ4 ? 0.95 : 0.82,
            inferenceTimeMs: latency * 1.2, // Simulated correlation
            confidenceScore: accuracy * 0.9 + 0.05, // Correlated with accuracy
            compressionRatio: sourceIsQ4 ? 0.4 : 0.2, // Q4 compresses more
          },
          histogramData: [
            { bin: "0-50ms", count: Math.floor(Math.random() * 10 + 5) },
            { bin: "50-100ms", count: Math.floor(Math.random() * 20 + 15) },
            { bin: "100-150ms", count: Math.floor(Math.random() * 15 + 10) },
            { bin: "150-200ms", count: Math.floor(Math.random() * 8 + 3) },
            { bin: "200ms+", count: Math.floor(Math.random() * 5) }
          ]
        }
      });
    }).as('getQuantizationImpactMetrics');
  });

  // Function to configure a workflow (adapt selectors and logic)
  const configureWorkflow = (agentConfig) => {
    cy.log(`Configuring workflow with: ${JSON.stringify(agentConfig)}`);
    // Example: Selecting agents from dropdowns
    cy.get('[data-testid="select-agent-1"]').select(agentConfig.agent1);
    cy.get('[data-testid="select-agent-2"]').select(agentConfig.agent2);
    // Add steps for configuring tools, prompts, etc., if part of the workflow setup
  };

  // Function to monitor RAM during execution
  const monitorRamUsage = (durationSeconds = 10) => {
    const startTime = Date.now();
    const ramReadings = [];

    const checkRam = () => {
      if (Date.now() - startTime > durationSeconds * 1000) {
        cy.log(`RAM Monitoring Complete. Readings: ${JSON.stringify(ramReadings)}`);
        return; // Stop monitoring after duration
      }

      // Check if the RAM indicator element exists and get its value
      cy.get('[data-testid="realtime-ram-usage-display"]', { timeout: 2000 }) // Short timeout for quick check
        .should('be.visible') // Ensure the indicator is visible
        .invoke('text')
        .then(text => {
          // Example: Assuming text is like "RAM: 750 MB"
          const match = text.match(/RAM:\s*(\d+(\.\d+)?)\s*MB/i);
          if (match && match[1]) {
            const currentRam = parseFloat(match[1]);
            ramReadings.push(currentRam);
            cy.log(`RAM Usage: ${currentRam} MB`);
          } else {
             cy.log(`Could not parse RAM usage from text: "${text}"`);
          }
        })
        .then(() => {
          // Wait a bit before the next check
          cy.wait(1000); // Check every second
          checkRam(); // Recursive call
        });
    };

    checkRam(); // Start monitoring
  };

  // Helper Function to configure and run a SINGLE MODEL task and extract CompL
  const runSingleModelAndGetCompL = (modelName) => {
    cy.log(`Running single model task: ${modelName}`);

    // Configuration Phase
    cy.get('[data-testid="select-single-model"]').select(modelName); // Adapt selector

    // Execution Phase
    cy.get('[data-testid="start-button"]').click(); // Adapt selector

    // Wait for Completion & Get Result
    cy.get('[data-testid="status-indicator-completed"]', { timeout: 90000 }).should('be.visible'); // Adapt selector and timeout

    // Extract CompL (assuming 3rd column, adapt selector and parsing)
    return cy.get('table tbody tr:first-child td:nth-child(3)', { timeout: 10000 })
      .should('not.be.empty')
      .invoke('text')
      .then(text => {
        cy.log(`Extracted CompL text for ${modelName}: ${text}`);
        const timeMatch = text.match(/(\d+(\.\d+)?)\s*ms/); // Adapt parsing as needed
        const parsedTime = timeMatch ? parseFloat(timeMatch[1]) : null;
        if (parsedTime === null) {
            cy.log(`WARNING: Could not parse time from CompL text: "${text}"`);
        }
        cy.log(`Parsed CompL Time for ${modelName}: ${parsedTime} ms`);
        return parsedTime;
      });
  };

  it('should execute workflow with Config A and display RAM usage', () => {
    const configA = { agent1: 'PlannerAgent', agent2: 'ExecutorAgent_Simple' };
    configureWorkflow(configA);

    // Start the workflow
    cy.get('[data-testid="start-workflow-button"]').click();
    cy.wait('@startWorkflow');

    // Monitor RAM while the workflow (mocked) runs
    monitorRamUsage(5); // Monitor for 5 seconds

    // Wait for workflow completion (based on mock or real status check)
    cy.wait('@getWorkflowStatus', { timeout: 15000 }); // Wait for completion status
    cy.get('[data-testid="workflow-status-display"]').should('contain', 'COMPLETED');

    // Final check that RAM indicator was visible at some point
    cy.get('[data-testid="realtime-ram-usage-display"]').should('exist');
  });

  it('should execute workflow with Config B and display RAM usage', () => {
    const configB = { agent1: 'PlannerAgent', agent2: 'ExecutorAgent_Complex' }; // Different second agent
    configureWorkflow(configB);

    // Start the workflow
    cy.get('[data-testid="start-workflow-button"]').click();
    cy.wait('@startWorkflow');

    // Monitor RAM while the workflow (mocked) runs
    monitorRamUsage(5); // Monitor for 5 seconds

    // Wait for workflow completion
    cy.wait('@getWorkflowStatus', { timeout: 15000 });
    cy.get('[data-testid="workflow-status-display"]').should('contain', 'COMPLETED');

     // Final check that RAM indicator was visible at some point
    cy.get('[data-testid="realtime-ram-usage-display"]').should('exist');

    // Note: Comparing exact RAM values between runs in automated tests is unreliable.
    // Focus on ensuring the indicator works and logging values for manual review/analysis.
  });

  it('should display agent state updates in real-time during workflow execution', () => {
    const config = { agent1: 'PlannerAgent', agent2: 'ExecutorAgent_Simple' };
    configureWorkflow(config);

    // Selectors for Agent State UI Elements (Adapt these!)
    const plannerStatusSelector = '[data-testid="agent-status-PlannerAgent"]'; // e.g., a text element
    const executorStatusSelector = '[data-testid="agent-status-ExecutorAgent_Simple"]';

    // Initial State Check
    // Ensure initial states are displayed correctly before starting
    cy.wait('@getAgentStates'); // Wait for initial state load if applicable
    cy.get(plannerStatusSelector).should('contain.text', 'Idle'); // Check initial state
    cy.get(executorStatusSelector).should('contain.text', 'Idle');

    // Start Workflow
    cy.get('[data-testid="start-workflow-button"]').click();
    cy.wait('@startWorkflow');

    // Check State Updates
    // Wait for the first state update call after starting
    cy.wait('@getAgentStates');
    cy.get(plannerStatusSelector, { timeout: 5000 }).should('contain.text', 'Thinking'); // Planner starts thinking

    // Wait for the second state update call
    cy.wait('@getAgentStates');
    cy.get(plannerStatusSelector, { timeout: 5000 }).should('contain.text', 'Waiting'); // Planner delegates
    cy.get(executorStatusSelector, { timeout: 5000 }).should('contain.text', 'Running'); // Executor starts running

    // Wait for the third state update call
    cy.wait('@getAgentStates');
    cy.get(plannerStatusSelector, { timeout: 5000 }).should('contain.text', 'Processing'); // Planner processes results
    cy.get(executorStatusSelector, { timeout: 5000 }).should('contain.text', 'Completed'); // Executor finishes

    // Wait for Workflow Completion
    cy.wait('@getWorkflowStatus', { timeout: 15000 }); // Wait for final status
    cy.get('[data-testid="workflow-status-display"]').should('contain', 'COMPLETED');

    // Optional: Check if states reset to Idle after completion
    cy.wait('@getAgentStates'); // Should fetch idle states now
    cy.get(plannerStatusSelector).should('contain.text', 'Idle');
    cy.get(executorStatusSelector).should('contain.text', 'Idle');
  });

  it('should display helpful error information in the debug console/area when a workflow fails to start', () => {
    // --- Setup: Force API failure ---
    cy.intercept('POST', '/api/workflows/start', {
      statusCode: 500,
      body: { message: 'Internal Server Error: Failed to initialize workflow resources.' }
    }).as('startWorkflowFail');

    // --- Configure a valid workflow ---
    const config = { agent1: 'PlannerAgent', agent2: 'ExecutorAgent_Simple' };
    configureWorkflow(config);

    // --- Trigger the action that will fail ---
    cy.get('[data-testid="start-workflow-button"]').click();

    // --- Wait for the failed API call ---
    cy.wait('@startWorkflowFail');

    // --- Verification: Check Debugging UI ---
    // Adapt selectors based on your actual debugging tools implementation
    const debugConsoleSelector = '[data-testid="app-debug-console"]';
    const errorEntrySelector = `${debugConsoleSelector} .error-entry`; // Example selector for an error line

    // Check if the debug console/area is visible
    cy.get(debugConsoleSelector, { timeout: 5000 })
      .should('be.visible');

    // Check if a relevant error message is displayed within the debug tool
    cy.get(errorEntrySelector)
      .last() // Check the most recent error entry
      .should('contain.text', 'Failed to start workflow') // General error context
      .and('contain.text', 'Internal Server Error') // Specific error type from API
      .and('contain.text', 'Failed to initialize workflow resources'); // Detailed message from API

    // Optional: Check for visual highlights if applicable
    // cy.get('[data-testid="start-workflow-button"]').should('have.class', 'button-error-highlight');
  });

  it('should remain responsive and stable when executing a workflow with a large number of agents', () => {
    const numberOfAgents = 25; // Simulate a larger number of agents
    const largeAgentConfig = {
        agent1: 'MasterPlanner',
        // Simulate configuration involving many agents (details depend on your UI/API)
        // This might involve selecting multiple agents if UI allows, or just setting up mocks
    };

    // --- Setup: Mock responses for many agents ---
    // Modify the agent state mock to handle a larger number of agents
    cy.intercept('GET', '/api/agents/states', (req) => {
        let largeAgentStates = {};
        // Simulate states for many agents - keep it simple for the test
        for (let i = 1; i <= numberOfAgents; i++) {
            const agentId = `Agent_${i}`;
            // Simulate some basic activity, e.g., most are idle, a few are running/thinking
            const status = (i % 5 === 0) ? 'Running' : 'Idle';
            largeAgentStates[agentId] = { status: status, details: `Task ${i}` };
        }
        // Add the main agents if needed
        largeAgentStates['MasterPlanner'] = { status: 'Thinking', details: 'Coordinating...' };

        req.reply({
            statusCode: 200,
            body: largeAgentStates
        });
    }).as('getLargeAgentStates');

    // Adjust workflow status mock if needed for longer execution
    cy.intercept('GET', '/api/workflows/wf-123/status', { statusCode: 200, body: { status: 'RUNNING' } }).as('getWorkflowStatusRunning'); // Keep it running initially

    // --- Configure the workflow (adapt as needed) ---
    // This step might be simplified if configuration itself doesn't involve selecting all N agents explicitly in the UI
    cy.log(`Configuring workflow for ${numberOfAgents} agents (mocked setup)`);
    // cy.get('[data-testid="select-agent-1"]').select(largeAgentConfig.agent1); // Example

    // --- Start Workflow ---
    cy.get('[data-testid="start-workflow-button"]').click();
    cy.wait('@startWorkflow'); // Assuming this still uses the same start endpoint

    // --- Check Responsiveness & Stability during execution ---
    cy.log('Checking UI responsiveness during large workflow execution...');

    // 1. Wait for initial state updates for many agents
    cy.wait('@getLargeAgentStates');
    // Check if a key element related to agent display is rendered without excessive delay
    cy.get(`[data-testid="agent-status-Agent_1"]`, { timeout: 15000 }).should('exist'); // Increased timeout slightly

    // 2. Perform a simple interaction check while workflow is "running"
    // Click a non-critical button or element to see if it responds quickly
    // cy.get('[data-testid="some-other-button"]').click(); // Adapt selector
    // cy.get('[data-testid="some-expected-result-of-click"]').should('be.visible'); // Check outcome

    // 3. Check for console errors (Cypress fails tests on uncaught exceptions by default)
    // We rely on Cypress's default behavior here. No specific command needed unless spying on console.error.

    // 4. Allow some time for potential updates/rendering load
    cy.wait(5000); // Wait for a few seconds

    // 5. Check again for console errors (redundant but emphasizes monitoring)
    // No command needed - test would fail if errors occurred.

    // --- Check for Completion (optional, depends on test goal) ---
    // Mock completion after a while
    cy.intercept('GET', '/api/workflows/wf-123/status', { statusCode: 200, body: { status: 'COMPLETED', result: 'Success' } }).as('getWorkflowStatusCompleted');
    cy.wait('@getWorkflowStatusCompleted', { timeout: 20000 }); // Wait for completion
    cy.get('[data-testid="workflow-status-display"]').should('contain', 'COMPLETED');

    cy.log('Large workflow completed without apparent crashes or major unresponsiveness.');
  });

  it('should show lower CompL for smaller models (Phi-4-mini) compared to larger ones', () => {
    let compL_large = null;
    let compL_small = null;

    const largeModelName = 'Model_X'; // Replace with your baseline/larger model name
    const smallModelName = 'Phi-4-mini'; // Replace with the actual name/value in your selector

    // Run Large Model Task first
    runSingleModelAndGetCompL(largeModelName).then(value => {
      expect(value, `CompL for large model (${largeModelName})`).to.be.a('number').and.to.be.greaterThan(0);
      compL_large = value;

      // Run Small Model Task (chained)
      // Add a small wait or clear action if needed between runs to ensure independence
      cy.wait(1000); // Small pause
      // cy.get('[data-testid="clear-results-button"]').click(); // Example clear action
      return runSingleModelAndGetCompL(smallModelName); // Return the promise
    }).then(value => {
      expect(value, `CompL for small model (${smallModelName})`).to.be.a('number').and.to.be.greaterThan(0);
      compL_small = value;

      // --- Comparison ---
      cy.log(`Comparing: Small Model CompL (${compL_small}) vs Large Model CompL (${compL_large})`);
      expect(compL_small).to.be.lessThan(compL_large, `Expected CompL for ${smallModelName} to be lower than ${largeModelName}`);
    });
  });

  // --- New Test Case for Constraint Feedback ---
  it('should display clear feedback when a workflow configuration exceeds simulated constraints', () => {
    // --- Selectors (Adapt!) ---
    const startButtonSelector = '[data-testid="start-workflow-button"]';
    const errorAlertSelector = '[data-testid="error-alert"]'; // Assuming same error alert component is used

    // --- Setup: Mock API failure due to constraint ---
    cy.intercept('POST', '/api/workflows/start', {
      statusCode: 400, // Bad Request (or other appropriate error code)
      body: {
        error: 'Constraint Violation',
        message: 'Workflow exceeds simulated memory limits for the selected configuration. Try using fewer agents or a smaller model.'
      }
    }).as('startWorkflowConstraintFail');

    // --- Configure a workflow (details might influence the constraint, but here API is mocked) ---
    const configExceedingLimits = { agent1: 'PlannerAgent', agent2: 'ExecutorAgent_VeryComplex' }; // Example config
    configureWorkflow(configExceedingLimits); // Assuming configureWorkflow is defined

    // --- Trigger the action ---
    cy.get(startButtonSelector).click();

    // --- Wait for the failed API call ---
    cy.wait('@startWorkflowConstraintFail');

    // --- Verification: Check Error Feedback ---
    cy.get(errorAlertSelector, { timeout: 5000 })
      .should('be.visible')
      .and('contain.text', 'Constraint Violation') // Check for general error type
      .and('contain.text', 'exceeds simulated memory limits'); // Check for specific constraint message

    // Optional: Verify workflow status did not become 'RUNNING'
    cy.get('[data-testid="workflow-status-display"]').should('not.contain', 'RUNNING');
  });

});

// --- New Test Suite for Adaptive Quantization Learning System (AQLS) ---
describe('Adaptive Quantization Learning System', () => {
  
  beforeEach(() => {
    cy.visit('/path/to/adaptive-quantization/page');
    
    // Mock API for historical task execution data
    cy.intercept('GET', '/api/quantization-learning/historical-data', {
      statusCode: 200,
      body: {
        totalRecords: 5840,
        sampledData: [
          // Complex reasoning tasks - strong pattern showing Q8 superiority
          { 
            taskId: 'task-reasoning-12345',
            taskType: 'complex_reasoning',
            q4Performance: { accuracy: 0.72, latencyMs: 430, memoryMB: 620, costUnits: 4.2 },
            q8Performance: { accuracy: 0.94, latencyMs: 780, memoryMB: 1240, costUnits: 9.6 },
            recommendation: 'q8_recommended',
            confidence: 0.92
          },
          // Mathematical tasks - clear Q8 advantage
          { 
            taskId: 'task-math-23456',
            taskType: 'complex_calculation',
            q4Performance: { accuracy: 0.76, latencyMs: 380, memoryMB: 580, costUnits: 3.8 },
            q8Performance: { accuracy: 0.98, latencyMs: 690, memoryMB: 1180, costUnits: 8.9 },
            recommendation: 'q8_recommended',
            confidence: 0.95
          },
          // Creative generation - marginal differences, prefer Q4 for efficiency
          { 
            taskId: 'task-creative-34567',
            taskType: 'creative_generation',
            q4Performance: { accuracy: 0.88, latencyMs: 410, memoryMB: 610, costUnits: 4.1 },
            q8Performance: { accuracy: 0.91, latencyMs: 820, memoryMB: 1290, costUnits: 9.8 },
            recommendation: 'q4_sufficient',
            confidence: 0.86
          },
          // Classification tasks - Q4 is clearly sufficient
          { 
            taskId: 'task-classify-45678',
            taskType: 'classification',
            q4Performance: { accuracy: 0.92, latencyMs: 210, memoryMB: 480, costUnits: 2.6 },
            q8Performance: { accuracy: 0.93, latencyMs: 560, memoryMB: 980, costUnits: 7.2 },
            recommendation: 'q4_recommended',
            confidence: 0.94
          },
          // Summarization - Q4 advantage in speed with acceptable accuracy
          { 
            taskId: 'task-summarize-56789',
            taskType: 'summarization',
            q4Performance: { accuracy: 0.89, latencyMs: 320, memoryMB: 520, costUnits: 3.2 },
            q8Performance: { accuracy: 0.92, latencyMs: 710, memoryMB: 1150, costUnits: 8.6 },
            recommendation: 'q4_recommended',
            confidence: 0.88
          }
        ],
        patternAnalysis: {
          taskTypePatterns: [
            { 
              taskType: 'complex_reasoning', 
              recommendedQuantization: 'Q8', 
              confidenceScore: 0.94,
              accuracyGainFactor: 1.31, // Q8 has 31% better accuracy
              speedPenaltyFactor: 1.82, // Q8 is 82% slower
              costIncreaseFactor: 2.29 // Q8 costs 2.29x more
            },
            { 
              taskType: 'complex_calculation', 
              recommendedQuantization: 'Q8', 
              confidenceScore: 0.97,
              accuracyGainFactor: 1.29,
              speedPenaltyFactor: 1.82,
              costIncreaseFactor: 2.34
            },
            { 
              taskType: 'creative_generation', 
              recommendedQuantization: 'Q4', 
              confidenceScore: 0.86,
              accuracyGainFactor: 1.03,
              speedPenaltyFactor: 2.00,
              costIncreaseFactor: 2.39
            },
            { 
              taskType: 'classification', 
              recommendedQuantization: 'Q4', 
              confidenceScore: 0.94,
              accuracyGainFactor: 1.01,
              speedPenaltyFactor: 2.67,
              costIncreaseFactor: 2.77
            },
            { 
              taskType: 'summarization', 
              recommendedQuantization: 'Q4', 
              confidenceScore: 0.91,
              accuracyGainFactor: 1.03,
              speedPenaltyFactor: 2.22,
              costIncreaseFactor: 2.69
            }
          ],
          contextualPatterns: [
            { context: 'financial_data', rule: 'always_prefer_q8', confidence: 0.98 },
            { context: 'real_time_chat', rule: 'always_prefer_q4', confidence: 0.92 },
            { context: 'high_load_system', rule: 'escalate_to_q8_only_when_necessary', confidence: 0.89 }
          ],
          anomalies: [
            { taskId: 'task-anomaly-12345', description: 'Q4 outperformed Q8 on complex reasoning task', significance: 'high', possibleExplanation: 'Task involved repetitive pattern matching with limited complexity' }
          ]
        }
      }
    }).as('getHistoricalData');
    
    // Mock API for learning model state
    cy.intercept('GET', '/api/quantization-learning/model', {
      statusCode: 200,
      body: {
        modelVersion: '3.2.1',
        lastTrainingTimestamp: Date.now() - 86400000, // 24 hours ago
        featuresCount: 42,
        trainingDataSize: 5840,
        validationAccuracy: 0.938,
        activeRules: 23,
        policyUpdateFrequency: 'daily',
        taskTypeSpecificRules: {
          'complex_reasoning': { defaultQuantization: 'Q8', thresholds: { complexity: 0.65, timeConstraint: 0.8 } },
          'complex_calculation': { defaultQuantization: 'Q8', thresholds: { complexity: 0.7, timeConstraint: 0.75 } },
          'creative_generation': { defaultQuantization: 'Q4', thresholds: { complexity: 0.85, timeConstraint: 0.5 } },
          'classification': { defaultQuantization: 'Q4', thresholds: { complexity: 0.9, timeConstraint: 0.4 } },
          'summarization': { defaultQuantization: 'Q4', thresholds: { complexity: 0.8, timeConstraint: 0.6 } }
        }
      }
    }).as('getLearningModel');
    
    // Mock API for task classifier
    cy.intercept('POST', '/api/quantization-learning/classify-task', (req) => {
      const taskText = req.body.taskText;
      const systemLoad = req.body.systemContext?.currentLoad || 0.5;
      const timeConstraint = req.body.constraints?.timeConstraint || 'normal';
      const importanceFactor = req.body.constraints?.importanceFactor || 1.0;
      
      // Determine task type based on keywords
      let taskType, complexity;
      if (taskText.includes('reason') || taskText.includes('logic') || taskText.includes('analyze argument')) {
        taskType = 'complex_reasoning';
        complexity = 0.85;
      } else if (taskText.includes('calculate') || taskText.includes('math') || taskText.includes('numerical')) {
        taskType = 'complex_calculation';
        complexity = 0.82;
      } else if (taskText.includes('create') || taskText.includes('generate') || taskText.includes('write')) {
        taskType = 'creative_generation';
        complexity = 0.58;
      } else if (taskText.includes('classify') || taskText.includes('categorize')) {
        taskType = 'classification';
        complexity = 0.45;
      } else if (taskText.includes('summarize') || taskText.includes('summary')) {
        taskType = 'summarization';
        complexity = 0.52;
      } else {
        taskType = 'general';
        complexity = 0.60;
      }
      
      // Determine whether Q8 is needed based on type, complexity and constraints
      let needsQ8, confidence, explanation;
      
      // These decisions simulate the learned model's decision process
      if (taskType === 'complex_reasoning' || taskType === 'complex_calculation') {
        needsQ8 = complexity > 0.7 || importanceFactor > 1.2;
        confidence = complexity > 0.8 ? 0.95 : 0.85;
        explanation = needsQ8 
          ? `Task involves high complexity ${taskType} (${complexity.toFixed(2)}) which historically benefits from Q8 precision`
          : `Despite being ${taskType}, task complexity (${complexity.toFixed(2)}) is below the learned threshold of 0.7`;
      } else {
        // For other task types, generally prefer Q4 unless exceptional circumstances
        needsQ8 = complexity > 0.9 || importanceFactor > 1.5;
        confidence = needsQ8 ? 0.8 : 0.92;
        explanation = needsQ8
          ? `Unusually complex ${taskType} (${complexity.toFixed(2)}) or high importance factor (${importanceFactor})`
          : `Task type ${taskType} historically performs well with Q4 quantization with minimal accuracy loss`;
      }
      
      // Adjust for system load (Q4 more preferred at high load)
      if (systemLoad > 0.8 && needsQ8) {
        needsQ8 = complexity > 0.85; // Higher threshold during high load
        confidence *= 0.9; // Reduced confidence in decision
        explanation += `. System under high load (${(systemLoad * 100).toFixed(0)}%), adjusted threshold applied.`;
      }
      
      // Adjust for time constraint
      if (timeConstraint === 'urgent' && needsQ8) {
        needsQ8 = complexity > 0.9; // Much higher threshold for urgent tasks
        confidence *= 0.9;
        explanation += `. Urgent time constraint applied, favoring Q4 speed.`;
      }
      
      req.reply({
        statusCode: 200,
        body: {
          taskId: `task-${Date.now()}`,
          taskType: taskType,
          complexity: complexity,
          recommendedQuantization: needsQ8 ? 'Q8' : 'Q4',
          confidence: confidence,
          explanation: explanation,
          projectedMetrics: {
            q4: {
              estimatedAccuracy: needsQ8 ? (0.65 + (complexity * 0.2)) : (0.85 + (complexity * 0.1)),
              estimatedLatencyMs: 300 + (complexity * 200),
              estimatedCostUnits: 2 + (complexity * 2)
            },
            q8: {
              estimatedAccuracy: 0.85 + (complexity * 0.1),
              estimatedLatencyMs: 600 + (complexity * 400),
              estimatedCostUnits: 6 + (complexity * 4)
            }
          },
          systemContextImpact: {
            currentLoad: systemLoad,
            loadFactorApplied: systemLoad > 0.8,
            timeConstraintFactorApplied: timeConstraint === 'urgent'
          }
        }
      });
    }).as('classifyTask');
    
    // Mock API for training new model
    cy.intercept('POST', '/api/quantization-learning/train', {
      statusCode: 202, // Accepted (long-running task)
      body: {
        trainingJobId: `train-job-${Date.now()}`,
        status: 'accepted',
        estimatedTimeSeconds: 180
      }
    }).as('trainModel');
    
    // Mock API for training status updates
    let trainingProgress = 0;
    cy.intercept('GET', '/api/quantization-learning/training-status/*', (req) => {
      trainingProgress += 20;
      const status = trainingProgress >= 100 ? 'completed' : 'in_progress';
      
      let modelImprovements = null;
      if (status === 'completed') {
        modelImprovements = {
          overallAccuracyGain: 0.03,
          taskTypeImprovements: [
            { taskType: 'complex_reasoning', thresholdChange: -0.05, accuracyChange: 0.04 },
            { taskType: 'classification', thresholdChange: 0.03, accuracyChange: 0.02 }
          ],
          newRules: [
            { description: 'Apply Q8 for financial calculations over $10,000', confidence: 0.91 }
          ]
        };
      }
      
      req.reply({
        statusCode: 200,
        body: {
          jobId: req.url.split('/').pop(),
          progress: trainingProgress,
          status: status,
          modelImprovements: modelImprovements,
          timeElapsedSeconds: Math.floor(trainingProgress * 1.8),
          timeRemainingSeconds: Math.floor((100 - trainingProgress) * 1.8)
        }
      });
    }).as('getTrainingStatus');
    
    // Mock API for policy application statistics
    cy.intercept('GET', '/api/quantization-learning/policy-stats', {
      statusCode: 200,
      body: {
        timeRange: {
          start: Date.now() - (7 * 24 * 3600000), // 7 days ago
          end: Date.now()
        },
        overallStats: {
          totalTasks: 12450,
          q4Tasks: 9712,
          q8Tasks: 2738,
          policyBasedDecisions: 12245,
          manualOverrides: 205,
          accuracyTargetMet: 0.962, // % of tasks that met accuracy targets
          costSavingsEstimate: 24380, // Cost units saved vs. using only Q8
          averageDecisionLatencyMs: 12.5 // Time to determine quantization
        },
        byTaskType: {
          'complex_reasoning': { total: 1850, q4: 412, q8: 1438, accuracyTargetMet: 0.982 },
          'complex_calculation': { total: 1420, q4: 326, q8: 1094, accuracyTargetMet: 0.976 },
          'creative_generation': { total: 3860, q4: 3705, q8: 155, accuracyTargetMet: 0.958 },
          'classification': { total: 2960, q4: 2908, q8: 52, accuracyTargetMet: 0.972 },
          'summarization': { total: 2360, q4: 2262, q8: 98, accuracyTargetMet: 0.948 }
        },
        trends: {
          q4Percentage: [72, 74, 78, 79, 78, 79, 78], // Last 7 days
          accuracyMet: [0.93, 0.94, 0.95, 0.95, 0.96, 0.97, 0.96],
          costEfficiency: [1.0, 1.05, 1.12, 1.15, 1.18, 1.19, 1.20] // Relative to day 1
        },
        recentQuantizationShifts: [
          { 
            date: new Date(Date.now() - (2 * 24 * 3600000)).toISOString().split('T')[0], 
            taskType: 'summarization',
            direction: 'q8_to_q4',
            reason: 'New data showed minimal accuracy impact with significant speed gain',
            impactScore: 0.15 // Relative importance of this shift
          },
          { 
            date: new Date(Date.now() - (5 * 24 * 3600000)).toISOString().split('T')[0], 
            taskType: 'complex_calculation',
            direction: 'threshold_lowered',
            reason: 'Fine-tuned complexity threshold based on empirical data',
            impactScore: 0.08
          }
        ]
      }
    }).as('getPolicyStats');
  });

  it('should analyze historical data to identify optimal quantization patterns by task type', () => {
    // --- Navigate to historical data analysis view ---
    cy.get('[data-testid="historical-analysis-tab"]').click();
    
    // Wait for data to load
    cy.wait('@getHistoricalData');
    
    // --- Verify task type pattern visualization ---
    cy.get('[data-testid="task-type-pattern-graph"]')
      .should('be.visible');
    
    // Check that the visualization shows the correct recommended quantization for each task type
    cy.get('[data-testid="pattern-complex_reasoning"]')
      .should('contain.text', 'Q8')
      .and('have.class', 'q8-recommended');
      
    cy.get('[data-testid="pattern-classification"]')
      .should('contain.text', 'Q4')
      .and('have.class', 'q4-recommended');
    
    // --- Verify the accuracy gain vs performance tradeoff visualization ---
    cy.get('[data-testid="tradeoff-matrix"]')
      .should('be.visible');
    
    // Verify specific task types in expected quadrants of the tradeoff matrix
    cy.get('[data-testid="tradeoff-point-complex_calculation"]')
      .should('have.attr', 'data-quadrant', 'high-gain-high-cost'); // Q8 worth the cost
      
    cy.get('[data-testid="tradeoff-point-classification"]')
      .should('have.attr', 'data-quadrant', 'low-gain-high-cost'); // Q4 preferable
    
    // --- Verify contextual pattern rules ---
    cy.get('[data-testid="contextual-rules-panel"]')
      .should('be.visible');
      
    cy.get('[data-testid="rule-financial_data"]')
      .should('contain.text', 'always_prefer_q8')
      .and('contain.text', '98%'); // Confidence
      
    cy.get('[data-testid="rule-real_time_chat"]')
      .should('contain.text', 'always_prefer_q4');
    
    // --- Check for anomaly detection ---
    cy.get('[data-testid="anomalies-section"]')
      .should('be.visible');
      
    cy.get('[data-testid="anomaly-task-anomaly-12345"]')
      .should('contain.text', 'Q4 outperformed Q8');
  });
  
  it('should correctly classify new tasks and recommend appropriate quantization', () => {
    // --- Navigate to task classification tool ---
    cy.get('[data-testid="task-classifier-tab"]').click();
    
    // --- Set up a complex reasoning task ---
    const complexReasoningTask = 'Analyze the logical consistency of these three arguments and identify any fallacies or contradictions present.';
    
    // Fill in task description
    cy.get('[data-testid="task-input"]')
      .type(complexReasoningTask);
    
    // Set system context (optional)
    cy.get('[data-testid="system-load-slider"]')
      .invoke('val', 0.5)
      .trigger('change');
      
    // Set constraints (optional)
    cy.get('[data-testid="time-constraint-select"]')
      .select('normal');
      
    cy.get('[data-testid="importance-factor-input"]')
      .clear()
      .type('1.0');
    
    // Classify the task
    cy.get('[data-testid="classify-task-button"]').click();
    
    // Wait for classification
    cy.wait('@classifyTask');
    
    // --- Verify classification results ---
    cy.get('[data-testid="task-type-result"]')
      .should('contain.text', 'complex_reasoning');
      
    cy.get('[data-testid="complexity-score"]')
      .should('contain.text', '0.85');
      
    cy.get('[data-testid="recommended-quantization-result"]')
      .should('contain.text', 'Q8')
      .and('have.class', 'q8-recommendation');
      
    cy.get('[data-testid="confidence-score"]')
      .invoke('text')
      .then(text => {
        const confidence = parseFloat(text);
        expect(confidence).to.be.gt(0.9); // High confidence for clear complex reasoning
      });
      
    cy.get('[data-testid="explanation-text"]')
      .should('contain.text', 'Task involves high complexity complex_reasoning')
      .and('contain.text', 'historically benefits from Q8 precision');
    
    // --- Check projected metrics comparison ---
    cy.get('[data-testid="projected-metrics-panel"]')
      .should('be.visible');
      
    // Q8 should show higher accuracy
    cy.get('[data-testid="projected-accuracy-q8"]')
      .invoke('text')
      .then(parseFloat)
      .should('be.gt', 0.9);
      
    cy.get('[data-testid="projected-accuracy-q4"]')
      .invoke('text')
      .then(q4Accuracy => {
        cy.get('[data-testid="projected-accuracy-q8"]')
          .invoke('text')
          .then(q8Accuracy => {
            expect(parseFloat(q8Accuracy)).to.be.gt(parseFloat(q4Accuracy));
          });
      });
      
    // Q4 should show better latency
    cy.get('[data-testid="projected-latency-q4"]')
      .invoke('text')
      .then(q4Latency => {
        cy.get('[data-testid="projected-latency-q8"]')
          .invoke('text')
          .then(q8Latency => {
            expect(parseFloat(q4Latency)).to.be.lt(parseFloat(q8Latency));
          });
      });
    
    // --- Now test with a simple classification task (should get Q4) ---
    cy.get('[data-testid="clear-task-button"]').click();
    
    const classificationTask = 'Classify these customer support tickets into the following categories: billing, technical, feature request, or general inquiry.';
    
    cy.get('[data-testid="task-input"]')
      .type(classificationTask);
      
    cy.get('[data-testid="classify-task-button"]').click();
    cy.wait('@classifyTask');
    
    cy.get('[data-testid="task-type-result"]')
      .should('contain.text', 'classification');
      
    cy.get('[data-testid="recommended-quantization-result"]')
      .should('contain.text', 'Q4')
      .and('have.class', 'q4-recommendation');
      
    cy.get('[data-testid="explanation-text"]')
      .should('contain.text', 'Task type classification historically performs well with Q4 quantization');
  });
  
  it('should update recommendations based on changing system context and constraints', () => {
    cy.get('[data-testid="task-classifier-tab"]').click();
    
    // Set up a moderately complex reasoning task
    const moderateTask = 'Analyze the following argument and identify the main premise and conclusion.';
    cy.get('[data-testid="task-input"]').type(moderateTask);
    
    // --- Test standard conditions (moderate load) ---
    cy.get('[data-testid="system-load-slider"]')
      .invoke('val', 0.5)
      .trigger('change');
    
    cy.get('[data-testid="time-constraint-select"]')
      .select('normal');
      
    cy.get('[data-testid="classify-task-button"]').click();
    cy.wait('@classifyTask');
    
    // Should generally recommend Q8 for reasoning tasks
    cy.get('[data-testid="recommended-quantization-result"]')
      .should('contain.text', 'Q8');
    
    // --- Test high load conditions ---
    cy.get('[data-testid="system-load-slider"]')
      .invoke('val', 0.9) // 90% system load
      .trigger('change');
    
    cy.get('[data-testid="classify-task-button"]').click();
    cy.wait('@classifyTask');
    
    // Should now be more conservative with Q8 recommendations
    cy.get('[data-testid="system-context-applied-notice"]')
      .should('be.visible')
      .and('contain.text', 'high load');
      
    // Check if explanation mentions the load factor
    cy.get('[data-testid="explanation-text"]')
      .should('contain.text', 'System under high load');
    
    // --- Test urgent time constraint ---
    cy.get('[data-testid="system-load-slider"]')
      .invoke('val', 0.5) // Reset load to normal
      .trigger('change');
      
    cy.get('[data-testid="time-constraint-select"]')
      .select('urgent');
    
    cy.get('[data-testid="classify-task-button"]').click();
    cy.wait('@classifyTask');
    
    // Should prioritize speed (Q4) with urgent constraint
    cy.get('[data-testid="time-constraint-applied-notice"]')
      .should('be.visible')
      .and('contain.text', 'urgent');
      
    cy.get('[data-testid="explanation-text"]')
      .should('contain.text', 'Urgent time constraint applied');
  });
  
  it('should train a new model based on recent historical data', () => {
    // --- Navigate to model training view ---
    cy.get('[data-testid="model-training-tab"]').click();
    
    // --- Check current model state ---
    cy.wait('@getLearningModel'); // Wait for current model data
    
    cy.get('[data-testid="current-model-info"]')
      .should('be.visible')
      .and('contain.text', 'Version 3.2.1');
      
    cy.get('[data-testid="model-training-data-size"]')
      .should('contain.text', '5840');
      
    cy.get('[data-testid="model-validation-accuracy"]')
      .should('contain.text', '93.8%');
    
    // --- Configure training parameters ---
    cy.get('[data-testid="training-data-range-select"]')
      .select('last_30_days');
      
    cy.get('[data-testid="include-anomalies-toggle"]')
      .check();
      
    cy.get('[data-testid="optimization-target-select"]')
      .select('balanced'); // Balanced between accuracy and performance
    
    // --- Start model training ---
    cy.get('[data-testid="start-training-button"]').click();
    
    // Wait for training to be initiated
    cy.wait('@trainModel');
    
    // --- Verify training progress updates ---
    cy.get('[data-testid="training-progress-area"]')
      .should('be.visible');
      
    cy.get('[data-testid="training-progress-bar"]')
      .should('exist');
    
    // First progress update (20%)
    cy.wait('@getTrainingStatus');
    cy.get('[data-testid="training-progress-bar"]')
      .invoke('attr', 'value')
      .then(value => {
        expect(parseInt(value)).to.be.gt(0);
      });
      
    cy.get('[data-testid="training-status-text"]')
      .should('contain.text', 'in_progress');
      
    // Skip ahead to completion (wait for several status checks)
    cy.wait('@getTrainingStatus');
    cy.wait('@getTrainingStatus');
    cy.wait('@getTrainingStatus');
    cy.wait('@getTrainingStatus');
    
    // Check for training completion
    cy.get('[data-testid="training-progress-bar"]')
      .should('have.attr', 'value', '100');
      
    cy.get('[data-testid="training-status-text"]')
      .should('contain.text', 'completed');
    
    // --- Verify model improvements display ---
    cy.get('[data-testid="model-improvements-panel"]')
      .should('be.visible');
      
    cy.get('[data-testid="overall-accuracy-gain"]')
      .should('contain.text', '+3%');
      
    cy.get('[data-testid="task-type-improvements"]')
      .should('contain.text', 'complex_reasoning')
      .and('contain.text', '-0.05'); // Threshold change
      
    cy.get('[data-testid="new-rules-added"]')
      .should('contain.text', 'financial calculations');
  });
  
  it('should display quantization policy application statistics and trends', () => {
    // --- Navigate to statistics view ---
    cy.get('[data-testid="policy-stats-tab"]').click();
    
    // Wait for statistics to load
    cy.wait('@getPolicyStats');
    
    // --- Check overall metrics ---
    cy.get('[data-testid="overall-stats-panel"]')
      .should('be.visible');
      
    cy.get('[data-testid="total-tasks-count"]')
      .should('contain.text', '12,450');
      
    cy.get('[data-testid="q4-q8-distribution"]').within(() => {
      cy.get('[data-testid="q4-percentage"]').should('contain.text', '78%'); // ~9712/12450
      cy.get('[data-testid="q8-percentage"]').should('contain.text', '22%'); // ~2738/12450
    });
    
    cy.get('[data-testid="accuracy-target-percentage"]')
      .should('contain.text', '96.2%');
      
    cy.get('[data-testid="cost-savings-estimate"]')
      .should('contain.text', '24,380');
      
    // --- Check task type specific statistics ---
    cy.get('[data-testid="task-type-stats-table"]')
      .should('be.visible');
      
    // Complex reasoning should use Q8 more frequently
    cy.get('[data-testid="task-type-row-complex_reasoning"]').within(() => {
      cy.get('[data-testid="q8-percentage-cell"]')
        .invoke('text')
        .then(parseFloat)
        .should('be.gt', 50); // Most should use Q8
    });
    
    // Classification should rarely use Q8
    cy.get('[data-testid="task-type-row-classification"]').within(() => {
      cy.get('[data-testid="q8-percentage-cell"]')
        .invoke('text')
        .then(parseFloat)
        .should('be.lt', 5); // Very few should use Q8
    });
    
    // --- Check trend visualization ---
    cy.get('[data-testid="trends-chart"]')
      .should('be.visible');
      
    // Q4 percentage should be over 70% for all days
    cy.get('[data-testid="q4-percentage-line"]')
      .should('exist');
      
    // Accuracy target met trend should show improvement
    cy.get('[data-testid="accuracy-met-line"]')
      .should('exist');
      
    // Cost efficiency should show improvement
    cy.get('[data-testid="cost-efficiency-line"]')
      .should('exist');
      
    // --- Check quantization policy shift analysis ---
    cy.get('[data-testid="policy-shifts-panel"]')
      .should('be.visible');
      
    // Should show the summarization shift from Q8 to Q4
    cy.get('[data-testid="shift-summarization"]')
      .should('contain.text', 'q8_to_q4')
      .and('contain.text', 'minimal accuracy impact');
  });
});