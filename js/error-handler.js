/**
 * Utility functions for better error handling
 */

/**
 * Safely gets an element by ID with built-in error handling
 * @param {string} id - Element ID to find
 * @param {boolean} warn - Whether to log warnings (default: true)
 * @returns {HTMLElement|null} - The element or null if not found
 */
function safeGetElementById(id, warn = true) {
  const element = document.getElementById(id);
  if (!element && warn) {
    console.warn(`⚠️ Element with ID "${id}" not found`);
  }
  return element;
}

/**
 * Safely executes a function if it exists
 * @param {Function} fn - Function to check and execute
 * @param {Array} args - Arguments to pass to the function
 * @param {string} fnName - Name of the function for warning messages
 * @returns {*} - Return value from function or undefined
 */
function safeExecuteFunction(fn, args = [], fnName = 'Function') {
  if (typeof fn === 'function') {
    return fn(...args);
  } else {
    console.warn(`⚠️ ${fnName} is not defined or not a function`);
    return undefined;
  }
}

/**
 * Checks if necessary dependencies are loaded
 * @param {Array} dependencies - Array of dependency names to check
 * @returns {boolean} - True if all dependencies are loaded
 */
function checkDependencies(dependencies) {
  const missing = [];
  
  dependencies.forEach(dep => {
    if (typeof window[dep] === 'undefined') {
      missing.push(dep);
    }
  });
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing dependencies: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
}

// Export utilities
window.ErrorHandler = {
  safeGetElementById,
  safeExecuteFunction,
  checkDependencies
};
