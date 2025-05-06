/**
 * DOM utility functions
 */

/**
 * Monitors DOM for errors and logs them
 */
function enableDOMErrorMonitoring() {
  console.log('📝 Monitoramento de erros DOM ativado');
  
  const originalCreateElement = document.createElement;
  
  // Monitor element creation
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    
    // Monitor failures when accessing non-existent elements
    const originalQuerySelector = element.querySelector;
    element.querySelector = function(selector) {
      const result = originalQuerySelector.call(this, selector);
      return result;
    };
    
    return element;
  };
  
  // Monitor mutations to catch removed elements that might be referenced later
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
          // Could add specific logging here if needed
        }
      });
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

/**
 * Check if element exists and is visible
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} - True if element exists and is visible
 */
function isElementVisible(element) {
  return element && 
         element.offsetParent !== null && 
         window.getComputedStyle(element).display !== 'none' &&
         window.getComputedStyle(element).visibility !== 'hidden';
}

/**
 * Wait for an element to appear in the DOM
 * @param {string} selector - CSS selector for the element
 * @param {number} timeout - Maximum time to wait in ms
 * @returns {Promise<HTMLElement>} - Promise resolving to the element
 */
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver((mutations) => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Set timeout
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found after ${timeout}ms`));
    }, timeout);
  });
}

/**
 * Check if an element exists in the DOM, optionally create a placeholder
 * @param {string} selector
 * @param {Object} options
 *   - createIfMissing: boolean (default: false)
 *   - elementTag: string (default: 'div')
 *   - parentSelector: string for container (default: 'body')
 *   - attributes: object of attributes to set on the created element
 * @returns {{exists: boolean, element: HTMLElement|null}}
 */
function elementExists(selector, options = {}) {
  const {
    createIfMissing = false,
    elementTag     = 'div',
    parentSelector = 'body',
    attributes     = {}
  } = options;
  let el = document.querySelector(selector);

  if (!el && createIfMissing) {
    if (window.DOMChecker && typeof window.DOMChecker.getElement === 'function') {
      el = window.DOMChecker.getElement(selector, true, parentSelector);
    } else {
      const clean      = selector.replace(/^[#.]/, '');
      const container  = document.querySelector(parentSelector) || document.body;
      el = document.createElement(elementTag);
      if (selector.startsWith('#'))   el.id        = clean;
      if (selector.startsWith('.'))   el.className = clean;
      Object.entries(attributes).forEach(([attr, value]) => {
        el.setAttribute(attr, value);
      });
      container.appendChild(el);
    }
  }

  return { exists: !!el, element: el };
}

// Initialize immediately
enableDOMErrorMonitoring();

// Export utilities
window.DOMUtils = {
  enableDOMErrorMonitoring,
  isElementVisible,
  waitForElement,
  elementExists
};
