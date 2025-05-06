const os = require('os');

// Parse input parameters
const params = JSON.parse(process.argv[2]);
const { workflowId, config, params: workflowParams } = params;

// Track process metrics
let running = true;
const reportInterval = 1000; // 1 second reporting interval

console.log(`Starting workflow ${workflowId} with config ${config.name}`);

// Example task based on configuration
function executeTask() {
  // CPU intensity based on configuration
  const cpuIntensity = config.cpuIntensity || 0.5;
  const memoryUsage = config.memoryUsage || 100; // MB
  
  // Simulate memory usage
  const memoryBlocks = [];
  const targetMemory = memoryUsage * 1024 * 1024; // Convert to bytes
  const blockSize = 1024 * 1024; // 1MB blocks
  
  for (let i = 0; i < targetMemory / blockSize && running; i++) {
    memoryBlocks.push(Buffer.alloc(blockSize));
  }
  
  // Simulate CPU usage
  const endTime = Date.now() + (reportInterval * cpuIntensity);
  while (Date.now() < endTime && running) {
    // CPU-intensive operations
    Math.random() * Math.random();
  }
  
  return memoryBlocks.length * blockSize;
}

// Report metrics
function reportMetrics() {
  if (!running) return;
  
  const memUsage = process.memoryUsage();
  
  const metrics = {
    type: 'metrics',
    workflowId,
    timestamp: Date.now(),
    memory: {
      rss: memUsage.rss / 1024 / 1024, // Convert to MB
      heapTotal: memUsage.heapTotal / 1024 / 1024, // Convert to MB
      heapUsed: memUsage.heapUsed / 1024 / 1024, // Convert to MB
      external: memUsage.external / 1024 / 1024 // Convert to MB
    }
  };
  
  console.log(JSON.stringify(metrics));
  
  setTimeout(reportMetrics, reportInterval);
}

// Start metrics reporting
reportMetrics();

// Run the workflow for the configured duration
const duration = config.duration || 60000; // Default 1 minute
setTimeout(() => {
  running = false;
  console.log(`Workflow ${workflowId} completed`);
  process.exit(0);
}, duration);

// Execute the task in a loop
(async function runWorkflow() {
  while (running) {
    await executeTask();
    
    // Small pause to allow other processes
    await new Promise(resolve => setTimeout(resolve, 50));
  }
})();

// Handle signals
process.on('SIGTERM', () => {
  console.log(`Workflow ${workflowId} terminated`);
  running = false;
});
