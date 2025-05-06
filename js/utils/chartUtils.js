/**
 * Chart Utilities
 * Helper functions for chart operations and conflict resolution
 */

// Global chart instances store
if (!window.chartInstances) {
  window.chartInstances = {};
}

const ChartUtils = {
  /**
   * Safely destroys an existing chart instance
   */
  destroyChart(id) {
    if (window.chartInstances && window.chartInstances[id]) {
      try {
        window.chartInstances[id].destroy();
        delete window.chartInstances[id];
        console.log(`Chart ${id} destroyed successfully`);
      } catch (err) {
        console.error(`Error destroying chart ${id}:`, err);
      }
    }
  },

  /**
   * Renders a fallback message when chart can't be displayed
   */
  renderFallback(container, chartType) {
    if (!container) return;
    
    container.innerHTML = `
      <div style="text-align: center; padding: 30px; border: 1px dashed #ccc;">
        <p style="color: #666;">Unable to load ${chartType} chart. Please check console for errors.</p>
        <button class="chart-retry-btn" style="margin-top: 10px; padding: 5px 10px; cursor: pointer;">
          Retry Loading
        </button>
      </div>
    `;
    
    // Add retry button functionality
    const retryBtn = container.querySelector('.chart-retry-btn');
    if (retryBtn && window.initializeCharts) {
      retryBtn.addEventListener('click', () => {
        window.initializeCharts();
      });
    }
  },

  /**
   * Check if a DOM element is ready to render a chart
   */
  isContainerReady(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Chart container #${containerId} not found`);
      return false;
    }
    
    // Check if container has dimensions
    if (container.clientWidth === 0 || container.clientHeight === 0) {
      console.warn(`Chart container #${containerId} has zero dimensions`);
      return false;
    }
    
    return true;
  },

  /**
   * Create container if it doesn't exist
   */
  ensureContainer(id, options = {}) {
    if (document.getElementById(id)) {
      return document.getElementById(id);
    }
    
    const container = document.createElement('div');
    container.id = id;
    container.className = options.className || 'chart-container-auto';
    container.style.height = options.height || '300px';
    container.style.margin = options.margin || '20px auto';
    
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'chart-fallback-text';
    loadingIndicator.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;"><div>Carregando gráfico...</div></div>';
    container.appendChild(loadingIndicator);
    
    const parent = document.querySelector(options.parent || '.chart-container') || 
                  document.querySelector('.visualizations-container') ||
                  document.querySelector('main') ||
                  document.body;
                  
    parent.appendChild(container);
    return container;
  },

  /**
   * Check for common chart rendering issues
   */
  diagnoseChartIssues() {
    const issues = [];
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
      issues.push('Chart.js is not loaded');
    }
    
    // Check for container issues
    const containers = document.querySelectorAll('.chart-container, .chart-container-auto');
    if (containers.length === 0) {
      issues.push('No chart containers found in the document');
    } else {
      containers.forEach(container => {
        if (container.clientWidth === 0 || container.clientHeight === 0) {
          issues.push(`Container ${container.id || 'unnamed'} has zero dimensions`);
        }
        
        if (window.getComputedStyle(container).display === 'none') {
          issues.push(`Container ${container.id || 'unnamed'} is hidden (display: none)`);
        }
      });
    }
    
    // Log results
    if (issues.length > 0) {
      console.warn('Chart rendering issues detected:', issues);
      return {
        hasIssues: true,
        issues
      };
    }
    
    return { hasIssues: false };
  }
};

// Make it globally accessible
window.ChartUtils = ChartUtils;

// Diagnose issues when loaded
document.addEventListener('DOMContentLoaded', () => {
  // Allow time for other scripts to load first
  setTimeout(() => {
    ChartUtils.diagnoseChartIssues();
  }, 500);
});

export default ChartUtils;
