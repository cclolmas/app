/**
 * Chart Initialization Utility
 * Ensures charts render correctly by verifying DOM elements and data integrity
 */

class ChartInitializer {
  constructor(options = {}) {
    this.debug = options.debug || false;
    this.containerCheck = options.containerCheck !== false;
    this.dataValidation = options.dataValidation !== false;
    this.registeredCharts = {};
    this.chartContainers = {};
    this.initStartTime = Date.now();
    
    // Debug logging
    if (this.debug) {
      console.log('ChartInitializer created with options:', options);
    }
  }
  
  /**
   * Register a chart for initialization
   * @param {string} id - Chart ID
   * @param {Function} initFn - Initialization function
   * @param {Object} options - Chart specific options
   */
  register(id, initFn, options = {}) {
    if (this.debug) {
      console.log(`Registering chart: ${id}`);
    }
    
    this.registeredCharts[id] = {
      initFn,
      options,
      status: 'registered',
      error: null
    };
    
    return this;
  }
  
  /**
   * Ensure a container exists for the chart
   * @param {string} id - Container ID
   * @param {Object} dimensions - Container dimensions
   * @returns {HTMLElement|null} - The container element or null
   */
  ensureContainer(id, dimensions = { width: 320, height: 240 }) {
    let container = document.getElementById(id);
    
    if (!container) {
      if (this.debug) {
        console.warn(`Chart container #${id} not found, creating it`);
      }
      
      // Create container
      container = document.createElement('div');
      container.id = id;
      container.className = 'chart-container chart-auto-created';
      container.style.width = dimensions.width + 'px';
      container.style.height = dimensions.height + 'px';
      container.style.margin = '15px 0';
      
      // Add a loading indicator
      const loading = document.createElement('div');
      loading.className = 'chart-fallback-text';
      loading.textContent = 'Carregando visualização...';
      container.appendChild(loading);
      
      // Find a reasonable place to append it
      const chartArea = document.querySelector('.chart-host') || 
                       document.querySelector('.visualizations-container') ||
                       document.querySelector('.chart-row') ||
                       document.querySelector('main') ||
                       document.body;
      
      chartArea.appendChild(container);
      this.chartContainers[id] = container;
    }
    
    return container;
  }
  
  /**
   * Validate data for a specific chart type
   * @param {Object} data - The chart data
   * @param {string} type - Chart type
   * @returns {Object} - Validation result
   */
  validateData(data, type = 'generic') {
    // Handle null or undefined data
    if (!data) {
      return {
        isValid: false,
        message: 'Dados não fornecidos'
      };
    }
    
    try {
      // Additional validation based on chart type
      switch (type) {
        case 'sankey':
          // Validate nodes and links
          if (!data.nodes || !Array.isArray(data.nodes) || data.nodes.length === 0) {
            return {
              isValid: false,
              message: 'Dados do Sankey inválidos: nós ausentes ou vazios'
            };
          }
          if (!data.links || !Array.isArray(data.links)) {
            return {
              isValid: false,
              message: 'Dados do Sankey inválidos: links ausentes ou em formato incorreto'
            };
          }
          break;
          
        // Add validation for other chart types
        
        default:
          // Generic validation
          if (Array.isArray(data) && data.length === 0) {
            return {
              isValid: false,
              message: 'Array de dados vazio'
            };
          }
      }
      
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        message: `Erro ao validar dados: ${error.message}`
      };
    }
  }
  
  /**
   * Initialize all registered charts
   */
  initializeAll() {
    const startTime = Date.now();
    if (this.debug) {
      console.log(`Starting chart initialization at ${startTime}ms since page load`);
    }
    
    // Process each registered chart
    Object.entries(this.registeredCharts).forEach(([id, chart]) => {
      this.initializeChart(id);
    });
    
    if (this.debug) {
      console.log(`Chart initialization completed in ${Date.now() - startTime}ms`);
    }
  }
  
  /**
   * Initialize a specific chart
   * @param {string} id - Chart ID
   * @returns {boolean} - Success status
   */
  initializeChart(id) {
    const chart = this.registeredCharts[id];
    if (!chart) {
      console.error(`Chart ${id} not registered`);
      return false;
    }
    
    try {
      // Ensure container exists
      const containerId = chart.options.containerId || `chart-${id}`;
      const container = this.ensureContainer(containerId, chart.options.dimensions);
      if (!container) {
        chart.status = 'error';
        chart.error = 'Container could not be created';
        return false;
      }
      
      // Validate data if provided
      if (chart.options.data) {
        const validation = this.validateData(chart.options.data, chart.options.type);
        if (!validation.isValid) {
          chart.status = 'error';
          chart.error = validation.message;
          this.displayError(container, validation.message);
          return false;
        }
      }
      
      // Initialize the chart
      const startTime = Date.now();
      chart.instance = chart.initFn(container, chart.options.data);
      chart.status = 'initialized';
      
      if (this.debug) {
        console.log(`Chart ${id} initialized in ${Date.now() - startTime}ms`);
      }
      
      // Remove loading indicator if present
      const loadingIndicator = container.querySelector('.chart-fallback-text');
      if (loadingIndicator) {
        loadingIndicator.remove();
      }
      
      return true;
    } catch (error) {
      chart.status = 'error';
      chart.error = error.message;
      
      if (this.debug) {
        console.error(`Error initializing chart ${id}:`, error);
      }
      
      // Display error in container
      const container = this.chartContainers[chart.options.containerId || `chart-${id}`];
      if (container) {
        this.displayError(container, `Chart initialization failed: ${error.message}`);
      }
      
      return false;
    }
  }
  
  /**
   * Display error message in a chart container
   * @param {HTMLElement} container - The chart container
   * @param {string} message - Error message
   */
  displayError(container, message) {
    // Clear container first
    container.innerHTML = '';
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'chart-error';
    errorDiv.style.color = 'red';
    errorDiv.style.padding = '20px';
    errorDiv.style.textAlign = 'center';
    
    // Add error icon
    const icon = document.createElement('div');
    icon.innerHTML = '⚠️';
    icon.style.fontSize = '24px';
    icon.style.marginBottom = '10px';
    errorDiv.appendChild(icon);
    
    // Add error message
    const text = document.createElement('p');
    text.textContent = message;
    errorDiv.appendChild(text);
    
    // Add retry button
    const retryButton = document.createElement('button');
    retryButton.textContent = 'Retry';
    retryButton.style.marginTop = '10px';
    retryButton.style.padding = '5px 10px';
    retryButton.style.cursor = 'pointer';
    retryButton.onclick = () => window.location.reload();
    errorDiv.appendChild(retryButton);
    
    container.appendChild(errorDiv);
  }
  
  /**
   * Generate a status report for all charts
   * @returns {Object} - Status report
   */
  getStatus() {
    const report = {
      totalCharts: Object.keys(this.registeredCharts).length,
      initialized: 0,
      failed: 0,
      pending: 0,
      charts: {}
    };
    
    Object.entries(this.registeredCharts).forEach(([id, chart]) => {
      report.charts[id] = {
        status: chart.status,
        error: chart.error,
        containerId: chart.options.containerId || `chart-${id}`
      };
      
      if (chart.status === 'initialized') {
        report.initialized++;
      } else if (chart.status === 'error') {
        report.failed++;
      } else {
        report.pending++;
      }
    });
    
    return report;
  }
  
  /**
   * Create a debug panel to display chart status
   */
  createDebugPanel() {
    // Create panel container
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.bottom = '10px';
    panel.style.right = '10px';
    panel.style.width = '300px';
    panel.style.maxHeight = '400px';
    panel.style.overflowY = 'auto';
    panel.style.background = 'white';
    panel.style.border = '1px solid #ccc';
    panel.style.borderRadius = '4px';
    panel.style.padding = '10px';
    panel.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    panel.style.zIndex = '10000';
    panel.style.fontSize = '12px';
    
    // Add header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '10px';
    header.style.borderBottom = '1px solid #eee';
    header.style.paddingBottom = '5px';
    
    const title = document.createElement('h3');
    title.textContent = 'Chart Debug Panel';
    title.style.margin = '0';
    title.style.fontSize = '14px';
    header.appendChild(title);
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => panel.remove();
    header.appendChild(closeBtn);
    
    panel.appendChild(header);
    
    // Add status summary
    const updateContent = () => {
      // Clear content except header
      while (panel.childNodes.length > 1) {
        panel.removeChild(panel.lastChild);
      }
      
      // Get status
      const status = this.getStatus();
      
      // Create summary section
      const summary = document.createElement('div');
      summary.style.marginBottom = '10px';
      summary.style.padding = '5px';
      summary.style.background = '#f5f5f5';
      summary.style.borderRadius = '3px';
      
      summary.innerHTML = `
        <div>Total charts: ${status.totalCharts}</div>
        <div style="color: green;">Initialized: ${status.initialized}</div>
        <div style="color: red;">Failed: ${status.failed}</div>
        <div style="color: orange;">Pending: ${status.pending}</div>
      `;
      
      panel.appendChild(summary);
      
      // Add chart details
      const details = document.createElement('div');
      
      Object.entries(status.charts).forEach(([id, chart]) => {
        const chartItem = document.createElement('div');
        chartItem.style.marginBottom = '5px';
        chartItem.style.padding = '5px';
        chartItem.style.border = '1px solid #eee';
        chartItem.style.borderRadius = '3px';
        
        let statusColor = '';
        switch (chart.status) {
          case 'initialized': statusColor = 'green'; break;
          case 'error': statusColor = 'red'; break;
          default: statusColor = 'orange';
        }
        
        chartItem.innerHTML = `
          <div><strong>Chart ID:</strong> ${id}</div>
          <div><strong>Container:</strong> #${chart.containerId}</div>
          <div><strong>Status:</strong> <span style="color: ${statusColor};">${chart.status}</span></div>
          ${chart.error ? `<div><strong>Error:</strong> <span style="color: red;">${chart.error}</span></div>` : ''}
        `;
        
        details.appendChild(chartItem);
      });
      
      panel.appendChild(details);
      
      // Add refresh button
      const refreshBtn = document.createElement('button');
      refreshBtn.textContent = 'Refresh';
      refreshBtn.style.marginTop = '10px';
      refreshBtn.style.padding = '5px 10px';
      refreshBtn.style.cursor = 'pointer';
      refreshBtn.onclick = updateContent;
      
      panel.appendChild(refreshBtn);
      
      // Add retry all button if there are errors
      if (status.failed > 0) {
        const retryBtn = document.createElement('button');
        retryBtn.textContent = 'Retry All';
        retryBtn.style.marginTop = '10px';
        retryBtn.style.marginLeft = '5px';
        retryBtn.style.padding = '5px 10px';
        retryBtn.style.cursor = 'pointer';
        retryBtn.onclick = () => window.location.reload();
        
        panel.appendChild(retryBtn);
      }
    };
    
    // Initial content update
    updateContent();
    
    // Add panel to body
    document.body.appendChild(panel);
  }
}

// Create global instance
window.chartInitializer = new ChartInitializer({ debug: false });

// Auto-initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit to ensure all chart registrations are done
  setTimeout(() => {
    if (window.chartInitializer) {
      window.chartInitializer.initializeAll();
    }
  }, 100);
  
  // Show debug panel if URL has debug parameter
  if (window.location.search.includes('debug-charts')) {
    window.chartInitializer.debug = true;
    setTimeout(() => {
      window.chartInitializer.createDebugPanel();
    }, 500);
  }
});

// Add keyboard shortcut for debug panel (Ctrl+Shift+C)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    if (window.chartInitializer) {
      window.chartInitializer.debug = true;
      window.chartInitializer.createDebugPanel();
    }
  }
});
