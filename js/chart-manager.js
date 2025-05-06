/**
 * Chart Loading Manager
 * Coordinates data loading and chart rendering
 */

class ChartManager {
  constructor() {
    this.charts = {};
    this.dataProviders = {};
    this.loadingState = {};
    this.debug = false;
  }
  
  /**
   * Register a chart component with optional data provider
   */
  registerChart(id, options = {}) {
    this.charts[id] = {
      options,
      lastRendered: null,
      container: options.containerId || id,
      status: 'registered'
    };
    
    // Set up data provider if one is provided
    if (options.dataProvider) {
      this.registerDataProvider(id, options.dataProvider);
    }
    
    if (this.debug) {
      console.log(`Registered chart: ${id}`, options);
    }
    
    return this;
  }
  
  /**
   * Register a data provider for a chart
   */
  registerDataProvider(chartId, providerFn) {
    this.dataProviders[chartId] = providerFn;
    return this;
  }
  
  /**
   * Load data for a specific chart
   */
  async loadData(chartId, params = {}) {
    if (!this.dataProviders[chartId]) {
      if (this.debug) {
        console.warn(`No data provider registered for chart ${chartId}`);
      }
      return null;
    }
    
    this.loadingState[chartId] = 'loading';
    this.notifyLoadingState(chartId);
    
    try {
      if (this.debug) {
        console.log(`Loading data for chart ${chartId}`, params);
      }
      
      const data = await this.dataProviders[chartId](params);
      
      this.loadingState[chartId] = 'loaded';
      this.notifyLoadingState(chartId);
      
      return data;
    } catch (error) {
      this.loadingState[chartId] = 'error';
      this.notifyLoadingState(chartId, error);
      
      if (this.debug) {
        console.error(`Error loading data for chart ${chartId}:`, error);
      }
      
      return null;
    }
  }
  
  /**
   * Load data for all registered charts
   */
  async loadAllData(params = {}) {
    const loadingPromises = Object.keys(this.charts).map(chartId => 
      this.loadData(chartId, params)
    );
    
    return await Promise.all(loadingPromises);
  }
  
  /**
   * Notify a container of loading state changes
   */
  notifyLoadingState(chartId, error = null) {
    const container = document.getElementById(this.charts[chartId]?.container);
    if (!container) return;
    
    // Update container classes based on loading state
    container.classList.remove('chart-loading', 'chart-error', 'chart-loaded');
    
    switch (this.loadingState[chartId]) {
      case 'loading':
        container.classList.add('chart-loading');
        break;
      case 'error':
        container.classList.add('chart-error');
        // Add error message if container is empty
        if (container.children.length === 0) {
          const errorMsg = document.createElement('div');
          errorMsg.className = 'chart-error-message';
          errorMsg.textContent = error ? `Error: ${error.message}` : 'Error loading chart data';
          container.appendChild(errorMsg);
        }
        break;
      case 'loaded':
        container.classList.add('chart-loaded');
        break;
    }
  }
  
  /**
   * Check if all needed DOM containers exist
   */
  checkContainers() {
    const results = {};
    
    for (const chartId in this.charts) {
      const containerId = this.charts[chartId].container;
      const container = document.getElementById(containerId);
      
      results[chartId] = {
        id: containerId,
        exists: !!container,
        isEmpty: container ? container.children.length === 0 : false,
        visible: container ? this.isVisible(container) : false
      };
      
      if (this.debug && !container) {
        console.warn(`Container #${containerId} for chart ${chartId} not found`);
      }
    }
    
    return results;
  }
  
  /**
   * Check if an element is visible in the viewport
   */
  isVisible(element) {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           rect.width > 0 && 
           rect.height > 0;
  }
  
  /**
   * Create diagnostic report for charts
   */
  generateReport() {
    const containerCheck = this.checkContainers();
    const report = {
      charts: {},
      summary: {
        total: Object.keys(this.charts).length,
        containersFound: 0,
        containersVisible: 0,
        dataLoaded: 0,
        errors: 0
      }
    };
    
    for (const chartId in this.charts) {
      const chart = this.charts[chartId];
      const container = containerCheck[chartId];
      const dataStatus = this.loadingState[chartId];
      
      report.charts[chartId] = {
        container,
        dataStatus,
        options: chart.options,
        lastRendered: chart.lastRendered
      };
      
      if (container.exists) {
        report.summary.containersFound++;
        if (container.visible) {
          report.summary.containersVisible++;
        }
      }
      
      if (dataStatus === 'loaded') {
        report.summary.dataLoaded++;
      } else if (dataStatus === 'error') {
        report.summary.errors++;
      }
    }
    
    return report;
  }
  
  /**
   * Display chart diagnostic console
   */
  showDiagnostics() {
    const report = this.generateReport();
    
    console.group('Chart Manager Diagnostics');
    console.log('Summary:', report.summary);
    console.log('Detailed Report:', report);
    
    if (report.summary.containersFound < report.summary.total) {
      console.warn(`Missing containers: ${report.summary.total - report.summary.containersFound} charts don't have containers`);
    }
    
    if (report.summary.errors > 0) {
      console.error(`Errors: ${report.summary.errors} charts have data loading errors`);
    }
    
    console.groupEnd();
    
    // Create visual report in the page
    const reportContainer = document.createElement('div');
    reportContainer.style.position = 'fixed';
    reportContainer.style.top = '20px';
    reportContainer.style.right = '20px';
    reportContainer.style.zIndex = '10000';
    reportContainer.style.background = 'white';
    reportContainer.style.border = '1px solid #ccc';
    reportContainer.style.borderRadius = '4px';
    reportContainer.style.padding = '15px';
    reportContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    reportContainer.style.maxWidth = '500px';
    reportContainer.style.maxHeight = '80vh';
    reportContainer.style.overflow = 'auto';
    
    reportContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="margin: 0">Chart Diagnostics</h3>
        <button style="border: none; background: none; cursor: pointer; font-size: 20px;">&times;</button>
      </div>
      
      <div style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
        <div>Total Charts: ${report.summary.total}</div>
        <div>Containers Found: ${report.summary.containersFound}</div>
        <div>Visible Containers: ${report.summary.containersVisible}</div>
        <div>Data Loaded: ${report.summary.dataLoaded}</div>
        <div style="color: ${report.summary.errors > 0 ? 'red' : 'inherit'}">
          Errors: ${report.summary.errors}
        </div>
      </div>
      
      <div style="margin-bottom: 10px;">
        <button id="reload-charts" style="padding: 5px 10px;">Reload All Charts</button>
        <button id="fix-containers" style="padding: 5px 10px; margin-left: 5px;">Fix Missing Containers</button>
      </div>
      
      <div id="chart-details"></div>
    `;
    
    document.body.appendChild(reportContainer);
    
    // Add chart details
    const detailsContainer = reportContainer.querySelector('#chart-details');
    for (const chartId in report.charts) {
      const chartInfo = report.charts[chartId];
      
      const chartCard = document.createElement('div');
      chartCard.style.border = '1px solid #eee';
      chartCard.style.borderRadius = '4px';
      chartCard.style.padding = '10px';
      chartCard.style.marginBottom = '10px';
      
      let statusColor = 'black';
      if (chartInfo.dataStatus === 'error') {
        statusColor = 'red';
      } else if (chartInfo.dataStatus === 'loaded') {
        statusColor = 'green';
      } else if (chartInfo.dataStatus === 'loading') {
        statusColor = 'blue';
      }
      
      chartCard.innerHTML = `
        <div style="font-weight: bold;">${chartId}</div>
        <div>Container: #${chartInfo.container.id} - 
          ${chartInfo.container.exists 
            ? `<span style="color: green;">Found</span>` 
            : `<span style="color: red;">Missing</span>`}
        </div>
        <div>Visibility: 
          ${chartInfo.container.visible 
            ? `<span style="color: green;">Visible</span>` 
            : `<span style="color: orange;">Hidden</span>`}
        </div>
        <div>Data Status: <span style="color: ${statusColor};">${chartInfo.dataStatus || 'Not loaded'}</span></div>
      `;
      
      detailsContainer.appendChild(chartCard);
    }
    
    // Add event listeners
    reportContainer.querySelector('button').addEventListener('click', () => {
      reportContainer.remove();
    });
    
    reportContainer.querySelector('#reload-charts').addEventListener('click', () => {
      this.loadAllData();
      reportContainer.remove();
      setTimeout(() => this.showDiagnostics(), 1000);
    });
    
    reportContainer.querySelector('#fix-containers').addEventListener('click', () => {
      // For each missing container, create one
      for (const chartId in report.charts) {
        if (!report.charts[chartId].container.exists) {
          const container = document.createElement('div');
          container.id = report.charts[chartId].container.id;
          container.className = 'chart-container';
          container.style.height = '300px';
          container.style.margin = '15px 0';
          
          // Find a good place to put it
          const chartArea = document.querySelector('.chart-host') || 
                           document.querySelector('.visualizations-container') ||
                           document.querySelector('.chart-row') ||
                           document.querySelector('main') ||
                           document.body;
                           
          chartArea.appendChild(container);
        }
      }
      
      reportContainer.remove();
      setTimeout(() => this.showDiagnostics(), 500);
    });
  }
}

// Create global instance
window.chartManager = new ChartManager();

// Add keyboard shortcut for diagnostics (Ctrl+Alt+D)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.altKey && e.key === 'd') {
    e.preventDefault();
    if (window.chartManager) {
      window.chartManager.debug = true;
      window.chartManager.showDiagnostics();
    }
  }
});

// Auto-init when URL has diagnose-charts parameter
if (window.location.search.includes('diagnose-charts')) {
  window.addEventListener('load', () => {
    if (window.chartManager) {
      window.chartManager.debug = true;
      setTimeout(() => window.chartManager.showDiagnostics(), 1000);
    }
  });
}
