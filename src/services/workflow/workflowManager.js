const { spawn } = require('child_process');
const EventEmitter = require('events');

class WorkflowManager extends EventEmitter {
  constructor() {
    super();
    this.runningWorkflows = new Map();
    this.agentConfigurations = new Map();
  }

  /**
   * Register an agent configuration
   * @param {string} configId - Unique identifier for the configuration
   * @param {Object} config - Agent configuration parameters
   */
  registerAgentConfiguration(configId, config) {
    this.agentConfigurations.set(configId, {
      ...config,
      timestamp: new Date()
    });
    return configId;
  }

  /**
   * Get all available agent configurations
   */
  getAgentConfigurations() {
    return Array.from(this.agentConfigurations.entries()).map(([id, config]) => ({
      id,
      ...config
    }));
  }

  /**
   * Execute a workflow with specific agent configuration
   * @param {string} workflowId - Unique identifier for the workflow
   * @param {string} configId - Agent configuration ID to use
   * @param {Object} params - Additional workflow parameters
   */
  async executeWorkflow(workflowId, configId, params = {}) {
    if (!this.agentConfigurations.has(configId)) {
      throw new Error(`Agent configuration ${configId} not found`);
    }

    const config = this.agentConfigurations.get(configId);
    const process = spawn('node', [
      './worker.js',
      JSON.stringify({ workflowId, config, params })
    ]);

    this.runningWorkflows.set(workflowId, {
      process,
      configId,
      startTime: Date.now(),
      metrics: {
        cpu: [],
        memory: [],
        lastUpdated: null
      }
    });

    // Collect metrics from the process output
    process.stdout.on('data', (data) => {
      try {
        const metrics = JSON.parse(data.toString());
        if (metrics.type === 'metrics') {
          const workflow = this.runningWorkflows.get(workflowId);
          if (workflow) {
            workflow.metrics.cpu.push(metrics.cpu);
            workflow.metrics.memory.push(metrics.memory);
            workflow.metrics.lastUpdated = new Date();
            
            // Emit metrics update event
            this.emit('metrics-update', workflowId, {
              cpu: metrics.cpu,
              memory: metrics.memory,
              timestamp: workflow.metrics.lastUpdated
            });
          }
        }
      } catch (e) {
        console.log('Process output:', data.toString());
      }
    });

    process.on('exit', (code) => {
      const workflow = this.runningWorkflows.get(workflowId);
      this.emit('workflow-completed', workflowId, {
        exitCode: code,
        duration: Date.now() - workflow.startTime,
        metrics: workflow.metrics
      });
      this.runningWorkflows.delete(workflowId);
    });

    return workflowId;
  }

  /**
   * Get real-time metrics for a running workflow
   * @param {string} workflowId - The workflow ID to get metrics for
   */
  getWorkflowMetrics(workflowId) {
    const workflow = this.runningWorkflows.get(workflowId);
    if (!workflow) {
      return null;
    }
    
    return {
      workflowId,
      configId: workflow.configId,
      startTime: workflow.startTime,
      runningTime: Date.now() - workflow.startTime,
      metrics: workflow.metrics
    };
  }

  /**
   * Get all currently running workflows
   */
  getRunningWorkflows() {
    return Array.from(this.runningWorkflows.keys());
  }
}

module.exports = new WorkflowManager();
