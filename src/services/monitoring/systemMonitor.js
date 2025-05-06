const os = require('os');
const EventEmitter = require('events');

class SystemMonitor extends EventEmitter {
  constructor(options = {}) {
    super();
    this.interval = options.interval || 2000; // Default 2 seconds
    this.running = false;
    this.metrics = {
      memory: {
        rss: 0,
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        systemFree: 0,
        systemTotal: 0,
        systemUsed: 0,
        systemUsagePercent: 0
      }
    };
  }

  /**
   * Start the monitoring process
   */
  start() {
    if (this.running) return;
    
    this.running = true;
    this.monitorLoop();
    return this;
  }

  /**
   * Stop the monitoring process
   */
  stop() {
    this.running = false;
    return this;
  }

  /**
   * Main monitoring loop
   */
  monitorLoop() {
    if (!this.running) return;
    
    // Get memory usage
    const memInfo = process.memoryUsage();
    const freemem = os.freemem();
    const totalmem = os.totalmem();
    
    // Update memory metrics
    this.metrics.memory.rss = memInfo.rss;
    this.metrics.memory.heapUsed = memInfo.heapUsed;
    this.metrics.memory.heapTotal = memInfo.heapTotal;
    this.metrics.memory.external = memInfo.external;
    this.metrics.memory.systemFree = freemem;
    this.metrics.memory.systemTotal = totalmem;
    this.metrics.memory.systemUsed = totalmem - freemem;
    this.metrics.memory.systemUsagePercent = ((totalmem - freemem) / totalmem) * 100;
    
    // Emit the metrics event
    this.emit('metrics', this.metrics);
    
    // Schedule next update
    setTimeout(() => this.monitorLoop(), this.interval);
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      current: this.metrics.memory,
      history: null // History tracking removed
    };
  }
}

module.exports = new SystemMonitor();
