/**
 * Chart Debug Tool
 * Helps identify and fix common chart rendering issues
 */

class ChartDebugTool {
  constructor() {
    this.debugMode = false;
    this.containerChecks = {};
    this.chartInstances = {};
  }
  
  /**
   * Enable debug mode for all chart containers
   */
  enableDebugMode() {
    this.debugMode = true;
    document.querySelectorAll('.chart-container').forEach(container => {
      container.classList.add('debug');
      
      // Display container dimensions
      const dimensions = document.createElement('div');
      dimensions.className = 'chart-dimensions';
      dimensions.style.position = 'absolute';
      dimensions.style.bottom = '5px';
      dimensions.style.right = '5px';
      dimensions.style.background = 'rgba(0,0,0,0.6)';
      dimensions.style.color = 'white';
      dimensions.style.fontSize = '10px';
      dimensions.style.padding = '2px 5px';
      dimensions.style.borderRadius = '3px';
      dimensions.style.zIndex = '100';
      dimensions.textContent = `${container.clientWidth}×${container.clientHeight}`;
      
      container.appendChild(dimensions);
    });
    
    console.info('Chart debug mode enabled');
    return this;
  }
  
  /**
   * Check chart containers and report issues
   */
  checkContainers() {
    const containers = document.querySelectorAll('.chart-container, [id^="graph-"], canvas[id^="graph-"]');
    const results = [];
    
    containers.forEach(container => {
      const id = container.id;
      const rect = container.getBoundingClientRect();
      const style = window.getComputedStyle(container);
      const canvas = container.tagName === 'CANVAS' ? container : container.querySelector('canvas');
      
      const result = {
        id,
        element: container,
        width: rect.width,
        height: rect.height,
        visible: style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0,
        hasCanvas: !!canvas,
        canvasWidth: canvas ? canvas.width : 0,
        canvasHeight: canvas ? canvas.height : 0,
        status: 'ok'
      };
      
      // Check for issues
      if (rect.width === 0 || rect.height === 0) {
        result.status = 'zero-size';
      } else if (!result.visible) {
        result.status = 'invisible';
      } else if (!result.hasCanvas) {
        result.status = 'no-canvas';
      } else if (result.canvasWidth === 0 || result.canvasHeight === 0) {
        result.status = 'zero-canvas';
      }
      
      this.containerChecks[id] = result;
      results.push(result);
    });
    
    console.table(results.map(r => ({
      id: r.id,
      width: r.width,
      height: r.height,
      visible: r.visible,
      hasCanvas: r.hasCanvas,
      status: r.status
    })));
    
    return results;
  }
  
  /**
   * Fix common chart container issues
   */
  fixContainerIssues() {
    const results = this.checkContainers();
    let fixedCount = 0;
    
    results.forEach(result => {
      if (result.status === 'zero-size') {
        // Fix container with zero size
        const container = result.element;
        container.style.width = '100%';
        container.style.height = '300px';
        container.style.minHeight = '200px';
        fixedCount++;
      }
      
      if (result.status === 'invisible') {
        // Fix invisible container
        const container = result.element;
        container.style.display = 'block';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        fixedCount++;
      }
      
      if (result.status === 'zero-canvas' && result.hasCanvas) {
        // Fix canvas with zero dimensions
        const canvas = result.element.tagName === 'CANVAS' ? 
          result.element : result.element.querySelector('canvas');
          
        if (canvas) {
          canvas.width = 300;
          canvas.height = 200;
          fixedCount++;
        }
      }
    });
    
    console.log(`Fixed ${fixedCount} container issues.`);
    return fixedCount;
  }
  
  /**
   * Create diagnostic report in the page
   */
  showDiagnosticReport() {
    const results = this.checkContainers();
    
    // Create report container
    const reportContainer = document.createElement('div');
    reportContainer.className = 'chart-diagnostic-report';
    reportContainer.style.position = 'fixed';
    reportContainer.style.top = '50px';
    reportContainer.style.right = '20px';
    reportContainer.style.background = 'white';
    reportContainer.style.border = '1px solid #ccc';
    reportContainer.style.borderRadius = '4px';
    reportContainer.style.padding = '15px';
    reportContainer.style.zIndex = '10000';
    reportContainer.style.maxWidth = '400px';
    reportContainer.style.maxHeight = '80vh';
    reportContainer.style.overflow = 'auto';
    reportContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    
    // Add header
    const header = document.createElement('div');
    header.innerHTML = '<h3 style="margin-top:0">Chart Diagnostic Report</h3>';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.borderBottom = '1px solid #eee';
    header.style.paddingBottom = '10px';
    header.style.marginBottom = '15px';
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.border = 'none';
    closeButton.style.background = 'none';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => reportContainer.remove();
    header.appendChild(closeButton);
    
    reportContainer.appendChild(header);
    
    // Build report content
    const reportContent = document.createElement('div');
    
    // Summary
    const issueCount = results.filter(r => r.status !== 'ok').length;
    const summary = document.createElement('div');
    summary.innerHTML = `
      <p><strong>Container Count:</strong> ${results.length}</p>
      <p><strong>Issues Found:</strong> ${issueCount}</p>
    `;
    reportContent.appendChild(summary);
    
    // Issues table
    if (issueCount > 0) {
      const issuesTable = document.createElement('table');
      issuesTable.style.width = '100%';
      issuesTable.style.borderCollapse = 'collapse';
      issuesTable.style.marginTop = '10px';
      
      // Header
      const thead = document.createElement('thead');
      thead.innerHTML = `
        <tr>
          <th style="text-align:left;border-bottom:1px solid #ddd;padding:5px">Container</th>
          <th style="text-align:left;border-bottom:1px solid #ddd;padding:5px">Issue</th>
        </tr>
      `;
      issuesTable.appendChild(thead);
      
      // Body
      const tbody = document.createElement('tbody');
      results.filter(r => r.status !== 'ok').forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td style="border-bottom:1px solid #eee;padding:5px">${result.id}</td>
          <td style="border-bottom:1px solid #eee;padding:5px">${result.status}</td>
        `;
        tbody.appendChild(row);
      });
      issuesTable.appendChild(tbody);
      
      reportContent.appendChild(issuesTable);
    }
    
    // Fix button
    const fixButton = document.createElement('button');
    fixButton.textContent = 'Fix Issues';
    fixButton.style.background = '#4CAF50';
    fixButton.style.color = 'white';
    fixButton.style.border = 'none';
    fixButton.style.padding = '8px 16px';
    fixButton.style.borderRadius = '4px';
    fixButton.style.marginTop = '15px';
    fixButton.style.cursor = 'pointer';
    fixButton.onclick = () => {
      const fixed = this.fixContainerIssues();
      if (fixed > 0) {
        alert(`Fixed ${fixed} issues. Page will reload to apply changes.`);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        alert('No fixable issues found.');
      }
    };
    
    reportContent.appendChild(fixButton);
    reportContainer.appendChild(reportContent);
    
    // Add to page
    document.body.appendChild(reportContainer);
  }
  
  /**
   * Static method to create and run the debug tool
   */
  static runDiagnostics() {
    const tool = new ChartDebugTool();
    tool.enableDebugMode();
    tool.showDiagnosticReport();
    return tool;
  }
}

// Expose the tool globally
window.ChartDebugTool = ChartDebugTool;

// Add keyboard shortcut for diagnostics (Ctrl+Shift+D)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault();
    ChartDebugTool.runDiagnostics();
  }
});

// Auto-run diagnostics if URL has ?debug-charts parameter
if (window.location.search.includes('debug-charts')) {
  window.addEventListener('load', () => {
    setTimeout(() => ChartDebugTool.runDiagnostics(), 1000);
  });
}
