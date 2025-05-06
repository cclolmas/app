/**
 * DOM Element Checker Utility
 * Provides utilities to check for DOM elements and create placeholders if needed
 */

const DOMChecker = {
  /**
   * Check if an element exists in the DOM
   * @param {string} selector - CSS selector to check
   * @returns {boolean} - Whether the element exists
   */
  exists: function(selector) {
    return document.querySelector(selector) !== null;
  },
  
  /**
   * Get an element, optionally creating a placeholder if it doesn't exist
   * @param {string} selector - CSS selector to find
   * @param {boolean} createIfMissing - Whether to create a placeholder
   * @param {string} containerSelector - Where to insert the placeholder
   * @returns {Element|null} - The found or created element or null
   */
  getElement: function(selector, createIfMissing = false, containerSelector = 'body') {
    // Remove # or . from selector for ID creation
    const cleanSelector = selector.replace(/^[#.]/, '');
    let element = document.querySelector(selector);
    
    if (!element && createIfMissing) {
      const container = document.querySelector(containerSelector);
      if (!container) return null;
      
      if (selector.startsWith('#')) {
        element = document.createElement('div');
        element.id = cleanSelector;
      } else if (selector.startsWith('.')) {
        element = document.createElement('div');
        element.className = cleanSelector;
      } else {
        element = document.createElement(selector);
      }
      
      element.dataset.placeholder = 'true';
      element.style.minHeight = '100px';
      
      // Create a placeholder message
      const placeholderMsg = document.createElement('div');
      placeholderMsg.className = 'placeholder-message';
      placeholderMsg.textContent = `Placeholder for ${selector}`;
      placeholderMsg.style.textAlign = 'center';
      placeholderMsg.style.padding = '20px';
      placeholderMsg.style.color = '#666';
      placeholderMsg.style.backgroundColor = '#f0f0f0';
      placeholderMsg.style.border = '1px dashed #ccc';
      placeholderMsg.style.borderRadius = '4px';
      placeholderMsg.style.margin = '10px 0';
      
      element.appendChild(placeholderMsg);
      container.appendChild(element);
      
      console.log(`Created placeholder for ${selector}`);
    }
    
    return element;
  },
  
  /**
   * Create chart container if it doesn't exist
   * @param {string} id - Container ID
   * @param {string} containerSelector - Where to create the container
   * @returns {Element} - The created or existing container
   */
  ensureChartContainer: function(id, containerSelector = '.chart-container, .visualizations-container, main, body') {
    const selector = `#${id}`;
    let container = document.querySelector(selector);
    
    if (!container) {
      // Find a suitable parent from the list of selectors
      let parent = null;
      containerSelector.split(',').forEach(sel => {
        if (!parent) {
          const candidate = document.querySelector(sel.trim());
          if (candidate) parent = candidate;
        }
      });
      
      if (!parent) parent = document.body;
      
      // Create the container
      container = document.createElement('div');
      container.id = id;
      container.className = 'chart-container-auto';
      container.style.height = '300px';
      container.style.margin = '20px 0';
      container.style.position = 'relative';
      container.style.border = '1px solid #eee';
      container.style.borderRadius = '8px';
      container.style.padding = '10px';
      
      // Add placeholder content
      const placeholderContent = document.createElement('div');
      placeholderContent.className = 'chart-placeholder';
      placeholderContent.style.display = 'flex';
      placeholderContent.style.alignItems = 'center';
      placeholderContent.style.justifyContent = 'center';
      placeholderContent.style.height = '100%';
      placeholderContent.style.color = '#666';
      placeholderContent.innerHTML = `<div>Carregando gráfico...</div>`;
      
      container.appendChild(placeholderContent);
      parent.appendChild(container);
      
      console.log(`Created chart container: #${id}`);
    }
    
    return container;
  },
  
  /**
   * Initialize the DOM checker and replace missing elements
   */
  init: function() {
    console.log('DOM Checker initialized');
    
    // Create a global event to signal when DOM elements are ready
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('dom-checker-ready'));
      }, 100);
    });
  }
};

// Initialize on script load
DOMChecker.init();

// Make it globally accessible
window.DOMChecker = DOMChecker;
