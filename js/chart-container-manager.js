/**
 * Chart Container Manager
 * Helps manage chart containers, handles missing containers, and provides diagnostics
 */

class ChartContainerManager {
  constructor(options = {}) {
    this.containers = {};
    this.options = {
      autoCreate: true,
      debug: false,
      defaultHeight: '300px',
      defaultWidth: '100%',
      chartTypes: ['bar', 'line', 'pie', 'sankey', 'histogram', 'radar', 'scatter'],
      ...options
    };
    
    this.initCheckForMissing();
    
    // Make this instance available globally
    window.chartContainerManager = this;
    console.log('Chart Container Manager initialized');
  }
  
  /**
   * Check for chart containers mentioned in script but not in the DOM
   */
  initCheckForMissing() {
    // Wait for the page to be fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.searchForReferencedContainers();
      }, 1000);
    });
  }
  
  /**
   * Get all chart container elements
   * @returns {Array} - All chart containers in the DOM
   */
  getAllContainers() {
    // Common classes/IDs for chart containers
    const selectors = [
      '.chart-container', 
      '[id$="-chart"]',
      '[id$="-graph"]',
      '[id*="chart"]',
      '[id*="graph"]', 
      '.visualization', 
      '.chart'
    ];
    
    // Combine all matches
    const containers = new Set();
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => containers.add(el));
    });
    
    return Array.from(containers);
  }
  
  /**
   * Create a container with the given ID or options
   * @param {string|Object} idOrOptions - Container ID or options object
   * @returns {Element} - The created container
   */
  createContainer(idOrOptions) {
    const options = typeof idOrOptions === 'string' ? { id: idOrOptions } : idOrOptions;
    
    const id = options.id || `chart-container-${Math.floor(Math.random() * 10000)}`;
    const parent = options.parent ? document.querySelector(options.parent) : document.body;
    
    // Create the container element
    const container = document.createElement('div');
    container.id = id;
    container.className = options.className || 'chart-container chart-auto-created';
    container.style.width = options.width || this.options.defaultWidth;
    container.style.height = options.height || this.options.defaultHeight;
    container.style.position = 'relative';
    container.style.margin = options.margin || '15px 0';
    
    // Add a placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'chart-placeholder';
    placeholder.innerHTML = `<div style="display:flex; align-items:center; justify-content:center; height:100%; color:#666;">
                            <div>
                              <div style="text-align:center;">Aguardando dados para o gráfico...</div>
                              <div style="font-size:12px; text-align:center; margin-top:5px;">${id}</div>
                            </div>
                          </div>`;
    
    container.appendChild(placeholder);
    
    // Find a good place to insert the container
    if (!parent) {
      // Find appropriate locations if no specific parent
      const possibleParents = [
        '.chart-host',
        '.visualizations-container',
        '.chart-row',
        '.charts-section',
        'main',
        '.content',
        '.container'
      ];
      
      for (const selector of possibleParents) {
        const candidate = document.querySelector(selector);
        if (candidate) {
          candidate.appendChild(container);
          break;
        }
      }
      
      // Fallback to body
      if (!container.parentElement) {
        document.body.appendChild(container);
      }
    } else {
      parent.appendChild(container);
    }
    
    this.containers[id] = container;
    console.log(`Created chart container: #${id}`);
    
    return container;
  }
  
  /**
   * Search for chart container references in script elements
   */
  searchForReferencedContainers() {
    // Get all script content
    const scriptContent = Array.from(document.querySelectorAll('script'))
      .filter(script => !script.src) // Only inline scripts
      .map(script => script.textContent)
      .join('\n');
    
    // Regex patterns to find container references
    const patterns = [
      /getElementById\(['"]([^'"]*chart[^'"]*)['"]\)/g,
      /querySelector\(['"]#([^'"]*chart[^'"]*)['"]\)/g,
      /querySelector\(['"](#[^'"]*chart[^'"]*)['"]\)/g,
      /getElementById\(['"]([^'"]*graph[^'"]*)['"]\)/g,
      /querySelector\(['"]#([^'"]*graph[^'"]*)['"]\)/g,
      /querySelector\(['"](#[^'"]*graph[^'"]*)['"]\)/g
    ];
    
    const containerIds = new Set();
    
    // Extract all container IDs from script content
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(scriptContent)) !== null) {
        const id = match[1].replace(/^#/, '');
        containerIds.add(id);
      }
    });
    
    // Check if these containers exist and create them if not
    containerIds.forEach(id => {
      if (!document.getElementById(id) && this.options.autoCreate) {
        this.createContainer(id);
      }
    });
    
    return Array.from(containerIds);
  }
  
  /**
   * Check if a container exists for a chart
   * @param {string} id - Container ID to check
   * @param {boolean} autoCreate - Whether to create the container if it doesn't exist
   * @returns {Element} - The container element or null
   */
  getContainer(id, autoCreate = this.options.autoCreate) {
    if (this.containers[id]) {
      return this.containers[id];
    }
    
    const container = document.getElementById(id);
    
    if (container) {
      this.containers[id] = container;
      return container;
    }
    
    if (autoCreate) {
      return this.createContainer(id);
    }
    
    return null;
  }
  
  /**
   * Show errors in a chart container
   * @param {string} containerId - ID of the container
   * @param {string} errorMessage - Error message to display
   */
  showChartError(containerId, errorMessage) {
    const container = this.getContainer(containerId, true);
    
    // Clear container
    container.innerHTML = '';
    
    // Create error message
    const errorElement = document.createElement('div');
    errorElement.className = 'chart-error';
    errorElement.style.width = '100%';
    errorElement.style.height = '100%';
    errorElement.style.display = 'flex';
    errorElement.style.alignItems = 'center';
    errorElement.style.justifyContent = 'center';
    errorElement.style.flexDirection = 'column';
    errorElement.style.backgroundColor = '#fff0f0';
    errorElement.style.color = '#d32f2f';
    errorElement.style.padding = '20px';
    errorElement.style.boxSizing = 'border-box';
    errorElement.style.textAlign = 'center';
    errorElement.style.border = '1px solid #ffcdd2';
    errorElement.style.borderRadius = '4px';
    
    // Icon
    const icon = document.createElement('div');
    icon.innerHTML = '⚠️';
    icon.style.fontSize = '24px';
    icon.style.marginBottom = '10px';
    errorElement.appendChild(icon);
    
    // Message
    const message = document.createElement('div');
    message.textContent = errorMessage || 'Erro ao carregar o gráfico';
    errorElement.appendChild(message);
    
    // Retry button
    const retryButton = document.createElement('button');
    retryButton.innerText = 'Tentar Novamente';
    retryButton.style.marginTop = '15px';
    retryButton.style.padding = '8px 16px';
    retryButton.style.backgroundColor = '#f44336';
    retryButton.style.color = 'white';
    retryButton.style.border = 'none';
    retryButton.style.borderRadius = '4px';
    retryButton.style.cursor = 'pointer';
    retryButton.onclick = () => window.location.reload();
    errorElement.appendChild(retryButton);
    
    container.appendChild(errorElement);
  }
  
  /**
   * Create a debugging interface
   */
  showDebugInterface() {
    // Create debug panel
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.right = '20px';
    panel.style.bottom = '20px';
    panel.style.width = '300px';
    panel.style.maxHeight = '400px';
    panel.style.backgroundColor = 'white';
    panel.style.border = '1px solid #ccc';
    panel.style.borderRadius = '5px';
    panel.style.padding = '10px';
    panel.style.zIndex = '10000';
    panel.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    panel.style.overflowY = 'auto';
    
    // Header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '10px';
    header.style.borderBottom = '1px solid #eee';
    header.style.paddingBottom = '10px';
    
    const title = document.createElement('h3');
    title.textContent = 'Chart Container Manager';
    title.style.margin = '0';
    title.style.fontSize = '16px';
    header.appendChild(title);
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => panel.remove();
    header.appendChild(closeButton);
    
    panel.appendChild(header);
    
    // Content
    const content = document.createElement('div');
    
    // Get all chart containers
    const containers = this.getAllContainers();
    content.innerHTML = `<p>Found ${containers.length} chart containers</p>`;
    
    // Auto-created list
    const autoCreatedCount = Object.values(this.containers).filter(c => c.classList.contains('chart-auto-created')).length;
    if (autoCreatedCount > 0) {
      content.innerHTML += `<p style="color: orange">${autoCreatedCount} containers were auto-created</p>`;
    }
    
    // Container list
    const list = document.createElement('ul');
    list.style.paddingLeft = '20px';
    list.style.margin = '10px 0';
    
    containers.forEach(container => {
      const item = document.createElement('li');
      const isAutoCreated = container.classList.contains('chart-auto-created');
      
      item.innerHTML = `
        <strong>#${container.id || '(no id)'}</strong>
        <span>${container.className}</span>
        ${isAutoCreated ? '<span style="color: orange">(auto-created)</span>' : ''}
        <button class="check-btn" data-id="${container.id}" style="margin-left: 5px; font-size: 12px;">Check</button>
      `;
      list.appendChild(item);
    });
    
    content.appendChild(list);
    
    // Add a create container button
    const createBtn = document.createElement('button');
    createBtn.textContent = 'Create New Chart Container';
    createBtn.style.marginTop = '10px';
    createBtn.style.padding = '5px 10px';
    createBtn.onclick = () => {
      const id = prompt('Enter container ID:');
      if (id) this.createContainer(id);
    };
    content.appendChild(createBtn);
    
    panel.appendChild(content);
    document.body.appendChild(panel);
    
    // Add event listeners to check buttons
    panel.querySelectorAll('.check-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const container = document.getElementById(id);
        if (container) {
          console.log(`Container #${id}:`, container);
          
          // Add highlight effect
          const originalBorder = container.style.border;
          container.style.border = '2px solid red';
          setTimeout(() => {
            container.style.border = originalBorder;
          }, 2000);
          
          // Scroll to the container
          container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }
}

// Initialize the manager with default options
const chartContainerManager = new ChartContainerManager({
  autoCreate: true,
  debug: true
});

// Add global keyboard shortcut Ctrl+Alt+C to show the debug interface
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.altKey && e.key === 'c') {
    chartContainerManager.showDebugInterface();
  }
});
