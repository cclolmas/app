/**
 * Chart Debug Helper
 * Tools to help diagnose and fix chart visualization issues
 */

class ChartDebugger {
  constructor() {
    this.initialized = false;
    this.failedCharts = [];
    this.chartInstances = {};
    this.containerStatus = {};
    
    // Initialize when DOM is ready
    if (document.readyState !== 'loading') {
      this.initialize();
    } else {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    }
  }
  
  initialize() {
    if (this.initialized) return;
    this.initialized = true;
    
    console.log('Chart Debugger initialized');
    this.scanDOM();
    this.monitorChartCreation();
    
    // Add keyboard shortcut
    document.addEventListener('keydown', (e) => {
      // Alt+D for debugging
      if (e.altKey && e.key === 'd') {
        this.showDebugPanel();
      }
    });
    
    // Check URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('debug-charts')) {
      setTimeout(() => this.showDebugPanel(), 1000);
    }
  }
  
  scanDOM() {
    // Check for Chart.js charts
    this.scanChartJS();
    
    // Check for D3 charts
    this.scanD3Charts();
    
    // Check for other chart types (Plotly, etc.)
    this.scanOtherCharts();
    
    console.log('Chart scan complete');
  }
  
  scanChartJS() {
    // Look for Chart.js canvas elements
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      if (canvas.__chartjs) {
        // This is a Chart.js instance
        const chartId = canvas.id || `canvas-${Math.random().toString(36).substr(2, 9)}`;
        this.chartInstances[chartId] = {
          type: 'Chart.js',
          element: canvas,
          instance: canvas.__chartjs,
          status: 'active'
        };
      } else {
        // This might be a canvas waiting for Chart.js
        const parent = canvas.parentElement;
        if (parent && (
            parent.classList.contains('chart-container') || 
            parent.id.includes('chart') || 
            parent.id.includes('graph'))) {
          const chartId = canvas.id || `canvas-${Math.random().toString(36).substr(2, 9)}`;
          this.chartInstances[chartId] = {
            type: 'Canvas (potential chart)',
            element: canvas,
            instance: null,
            status: 'pending'
          };
        }
      }
    });
  }
  
  scanD3Charts() {
    // Look for D3 SVG elements
    const svgs = document.querySelectorAll('svg');
    svgs.forEach(svg => {
      const parent = svg.parentElement;
      if (parent && (
          parent.classList.contains('chart-container') || 
          parent.id.includes('chart') || 
          parent.id.includes('graph'))) {
        const chartId = svg.id || `svg-${Math.random().toString(36).substr(2, 9)}`;
        this.chartInstances[chartId] = {
          type: 'D3.js (SVG)',
          element: svg,
          instance: null,
          status: 'active'
        };
      }
    });
  }
  
  scanOtherCharts() {
    // Look for Plotly charts
    const plotlyContainers = document.querySelectorAll('.js-plotly-plot');
    plotlyContainers.forEach(container => {
      const chartId = container.id || `plotly-${Math.random().toString(36).substr(2, 9)}`;
      this.chartInstances[chartId] = {
        type: 'Plotly',
        element: container,
        instance: null,
        status: 'active'
      };
    });
    
    // Look for chart containers without charts
    const chartContainers = document.querySelectorAll('.chart-container, [id*="chart"], [id*="graph"]');
    chartContainers.forEach(container => {
      const chartId = container.id || `container-${Math.random().toString(36).substr(2, 9)}`;
      
      // Skip if already registered
      if (this.containerStatus[chartId]) return;
      
      // Check if this container has any chart elements
      const hasCanvas = container.querySelector('canvas') !== null;
      const hasSvg = container.querySelector('svg') !== null;
      const hasPlotly = container.querySelector('.js-plotly-plot') !== null;
      
      if (!hasCanvas && !hasSvg && !hasPlotly) {
        this.containerStatus[chartId] = {
          element: container,
          status: 'empty',
          message: 'Container without chart elements'
        };
      }
    });
  }
  
  monitorChartCreation() {
    // Monitor Chart.js chart creation
    if (window.Chart) {
      const originalConstructor = window.Chart;
      window.Chart = function(canvas, config) {
        const chart = new originalConstructor(canvas, config);
        const chartId = canvas.id || `chart-${Math.random().toString(36).substr(2, 9)}`;
        
        if (window.chartDebugger) {
          window.chartDebugger.chartInstances[chartId] = {
            type: 'Chart.js',
            element: canvas,
            instance: chart,
            config: config,
            status: 'active'
          };
        }
        
        return chart;
      };
      
      // Copy properties from original constructor
      for (const prop in originalConstructor) {
        if (originalConstructor.hasOwnProperty(prop)) {
          window.Chart[prop] = originalConstructor[prop];
        }
      }
    }
    
    // Monitor window errors
    window.addEventListener('error', (event) => {
      // Check if error is related to charts
      const errorMsg = event.message.toLowerCase();
      
      if (errorMsg.includes('chart') || 
          errorMsg.includes('canvas') || 
          errorMsg.includes('svg') || 
          errorMsg.includes('d3') || 
          errorMsg.includes('plot')) {
        
        this.failedCharts.push({
          message: event.message,
          source: event.filename,
          lineNumber: event.lineno,
          timestamp: new Date()
        });
      }
    });
  }
  
  fixCommonIssues() {
    // Fix missing chart containers
    Object.entries(this.containerStatus).forEach(([id, status]) => {
      if (status.status === 'empty') {
        // Try to create a placeholder chart
        const container = status.element;
        
        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.id = `${id}-canvas`;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        
        container.appendChild(canvas);
        
        // Create a simple placeholder chart if Chart.js is available
        if (window.Chart) {
          try {
            const chart = new window.Chart(canvas, {
              type: 'bar',
              data: {
                labels: ['Dados não disponíveis'],
                datasets: [{
                  label: 'Placeholder',
                  data: [1],
                  backgroundColor: 'rgba(200, 200, 200, 0.5)'
                }]
              },
              options: {
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Aguardando dados para visualização'
                  }
                }
              }
            });
            
            status.status = 'fixed';
            status.message = 'Placeholder chart created';
            
            this.chartInstances[`${id}-canvas`] = {
              type: 'Chart.js (placeholder)',
              element: canvas,
              instance: chart,
              status: 'active'
            };
          } catch (e) {
            status.status = 'error';
            status.message = `Failed to create placeholder: ${e.message}`;
          }
        }
      }
    });
  }
  
  showDebugPanel() {
    // Create debug panel
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.top = '20px';
    panel.style.right = '20px';
    panel.style.width = '400px';
    panel.style.maxHeight = '80vh';
    panel.style.backgroundColor = 'white';
    panel.style.border = '1px solid #ccc';
    panel.style.borderRadius = '5px';
    panel.style.padding = '10px';
    panel.style.zIndex = '10000';
    panel.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    panel.style.overflow = 'auto';
    panel.style.fontFamily = 'Arial, sans-serif';
    panel.style.fontSize = '14px';
    
    // Header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '10px';
    header.style.borderBottom = '1px solid #eee';
    header.style.paddingBottom = '10px';
    
    const title = document.createElement('h3');
    title.textContent = 'Chart Debugger';
    title.style.margin = '0';
    title.style.fontSize = '18px';
    header.appendChild(title);
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.lineHeight = '1';
    closeButton.onclick = () => panel.remove();
    header.appendChild(closeButton);
    
    panel.appendChild(header);
    
    // Action buttons
    const actions = document.createElement('div');
    actions.style.marginBottom = '15px';
    
    const scanButton = document.createElement('button');
    scanButton.textContent = 'Scan Again';
    scanButton.style.marginRight = '10px';
    scanButton.style.padding = '5px 10px';
    scanButton.onclick = () => {
      this.scanDOM();
      panel.remove();
      this.showDebugPanel();
    };
    actions.appendChild(scanButton);
    
    const fixButton = document.createElement('button');
    fixButton.textContent = 'Fix Issues';
    fixButton.style.marginRight = '10px';
    fixButton.style.padding = '5px 10px';
    fixButton.onclick = () => {
      this.fixCommonIssues();
      panel.remove();
      this.showDebugPanel();
    };
    actions.appendChild(fixButton);
    
    panel.appendChild(actions);
    
    // Chart instances section
    const instancesSection = document.createElement('div');
    instancesSection.style.marginBottom = '15px';
    
    const instancesTitle = document.createElement('h4');
    instancesTitle.textContent = 'Chart Instances';
    instancesTitle.style.fontSize = '16px';
    instancesTitle.style.marginBottom = '10px';
    instancesSection.appendChild(instancesTitle);
    
    const instanceCount = Object.keys(this.chartInstances).length;
    if (instanceCount === 0) {
      const noInstances = document.createElement('p');
      noInstances.textContent = 'No chart instances detected';
      noInstances.style.color = '#666';
      instancesSection.appendChild(noInstances);
    } else {
      const instancesList = document.createElement('div');
      instancesList.style.maxHeight = '200px';
      instancesList.style.overflow = 'auto';
      instancesList.style.border = '1px solid #eee';
      instancesList.style.borderRadius = '3px';
      instancesList.style.padding = '5px';
      
      Object.entries(this.chartInstances).forEach(([id, info]) => {
        const instance = document.createElement('div');
        instance.style.padding = '5px';
        instance.style.borderBottom = '1px solid #eee';
        instance.style.display = 'flex';
        instance.style.justifyContent = 'space-between';
        instance.style.alignItems = 'center';
        
        const statusColor = info.status === 'active' ? 'green' : 
                           info.status === 'pending' ? 'orange' : 'red';
                           
        instance.innerHTML = `
          <div>
            <strong>${id}</strong> 
            <span style="font-size: 12px; color: #666">(${info.type})</span>
          </div>
          <div style="color: ${statusColor}">${info.status}</div>
        `;
        
        instancesList.appendChild(instance);
      });
      
      instancesSection.appendChild(instancesList);
    }
    
    panel.appendChild(instancesSection);
    
    // Empty containers section
    const containersSection = document.createElement('div');
    containersSection.style.marginBottom = '15px';
    
    const containersTitle = document.createElement('h4');
    containersTitle.textContent = 'Chart Containers';
    containersTitle.style.fontSize = '16px';
    containersTitle.style.marginBottom = '10px';
    containersSection.appendChild(containersTitle);
    
    const emptyContainers = Object.entries(this.containerStatus).filter(([_, status]) => status.status === 'empty');
    
    if (emptyContainers.length === 0) {
      const noEmptyContainers = document.createElement('p');
      noEmptyContainers.textContent = 'No empty chart containers detected';
      noEmptyContainers.style.color = '#666';
      containersSection.appendChild(noEmptyContainers);
    } else {
      const containersList = document.createElement('div');
      containersList.style.maxHeight = '200px';
      containersList.style.overflow = 'auto';
      containersList.style.border = '1px solid #eee';
      containersList.style.borderRadius = '3px';
      containersList.style.padding = '5px';
      
      emptyContainers.forEach(([id, status]) => {
        const container = document.createElement('div');
        container.style.padding = '5px';
        container.style.borderBottom = '1px solid #eee';
        
        container.innerHTML = `
          <div>
            <strong>${id}</strong>
            <span style="color: orange">Empty</span>
          </div>
          <div style="font-size: 12px; color: #666">${status.message}</div>
        `;
        
        containersList.appendChild(container);
      });
      
      containersSection.appendChild(containersList);
    }
    
    panel.appendChild(containersSection);
    
    // Error section
    const errorSection = document.createElement('div');
    
    const errorTitle = document.createElement('h4');
    errorTitle.textContent = 'Chart Errors';
    errorTitle.style.fontSize = '16px';
    errorTitle.style.marginBottom = '10px';
    errorSection.appendChild(errorTitle);
    
    if (this.failedCharts.length === 0) {
      const noErrors = document.createElement('p');
      noErrors.textContent = 'No chart errors detected';
      noErrors.style.color = '#666';
      errorSection.appendChild(noErrors);
    } else {
      const errorList = document.createElement('div');
      errorList.style.maxHeight = '200px';
      errorList.style.overflow = 'auto';
      errorList.style.border = '1px solid #eee';
      errorList.style.borderRadius = '3px';
      errorList.style.padding = '5px';
      
      this.failedCharts.forEach(error => {
        const errorItem = document.createElement('div');
        errorItem.style.padding = '5px';
        errorItem.style.borderBottom = '1px solid #eee';
        errorItem.style.color = '#d32f2f';
        
        errorItem.innerHTML = `
          <div><strong>${error.message}</strong></div>
          <div style="font-size: 12px; color: #666">
            ${error.source}:${error.lineNumber}
          </div>
          <div style="font-size: 12px; color: #666">
            ${error.timestamp.toLocaleTimeString()}
          </div>
        `;
        
        errorList.appendChild(errorItem);
      });
      
      errorSection.appendChild(errorList);
    }
    
    panel.appendChild(errorSection);
    
    document.body.appendChild(panel);
  }
}

// Initialize the debugger
window.chartDebugger = new ChartDebugger();

// Add debug info to console
console.log('Chart debugging available - Press Alt+D to open debug panel');
