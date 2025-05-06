const express = require('express');
const router = express.Router();
const systemMonitor = require('../services/monitoring/systemMonitor');
const workflowManager = require('../services/workflow/workflowManager');

// Get system metrics
router.get('/api/monitor/system', (req, res) => {
  res.json(systemMonitor.getMetrics());
});

// Get available agent configurations
router.get('/api/monitor/configurations', (req, res) => {
  res.json(workflowManager.getAgentConfigurations());
});

// Create a new agent configuration
router.post('/api/monitor/configurations', (req, res) => {
  const { name, cpuIntensity, memoryUsage, duration } = req.body;
  
  if (!name || cpuIntensity === undefined || !memoryUsage || !duration) {
    return res.status(400).json({ error: 'Missing required configuration parameters' });
  }
  
  const configId = `config-${Date.now()}`;
  workflowManager.registerAgentConfiguration(configId, {
    name,
    cpuIntensity: parseFloat(cpuIntensity),
    memoryUsage: parseInt(memoryUsage, 10),
    duration: parseInt(duration, 10)
  });
  
  res.json({ success: true, configId });
});

// Get running workflows
router.get('/api/monitor/workflows', (req, res) => {
  const runningWorkflows = workflowManager.getRunningWorkflows();
  const workflowsWithMetrics = runningWorkflows.map(id => {
    return {
      id,
      metrics: workflowManager.getWorkflowMetrics(id)
    };
  });
  
  res.json(workflowsWithMetrics);
});

// Start a new workflow
router.post('/api/monitor/workflows', (req, res) => {
  const { configId, params } = req.body;
  
  if (!configId) {
    return res.status(400).json({ error: 'Missing required configuration ID' });
  }
  
  try {
    const workflowId = `workflow-${Date.now()}`;
    workflowManager.executeWorkflow(workflowId, configId, params);
    res.json({ success: true, workflowId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get metrics for a specific workflow
router.get('/api/monitor/workflows/:id', (req, res) => {
  const workflowId = req.params.id;
  const metrics = workflowManager.getWorkflowMetrics(workflowId);
  
  if (!metrics) {
    return res.status(404).json({ error: 'Workflow not found' });
  }
  
  res.json(metrics);
});

module.exports = router;
