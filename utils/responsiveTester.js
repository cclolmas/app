/**
 * Utility for testing responsive layouts across different device sizes
 */

// Common device viewport sizes for testing
const deviceViewports = {
  // Mobile devices
  mobileSm: { width: 320, height: 568, name: 'Small Mobile (iPhone SE)' },
  mobileMd: { width: 375, height: 667, name: 'Medium Mobile (iPhone 8)' },
  mobileLg: { width: 414, height: 896, name: 'Large Mobile (iPhone 11)' },
  
  // Tablets
  tabletSm: { width: 768, height: 1024, name: 'Small Tablet (iPad)' },
  tabletLg: { width: 1024, height: 1366, name: 'Large Tablet (iPad Pro)' },
  
  // Desktops
  laptopSm: { width: 1280, height: 800, name: 'Small Laptop' },
  laptopMd: { width: 1440, height: 900, name: 'Medium Laptop' },
  laptopLg: { width: 1920, height: 1080, name: 'Large Laptop/Desktop' },
  desktop4k: { width: 3840, height: 2160, name: '4K Display' },
};

/**
 * Creates a test case for a specific viewport size
 * @param {Object} viewport - The viewport configuration object
 * @param {Function} callback - Function to run in the specified viewport
 */
function testViewport(viewport, callback) {
  console.log(`Testing on ${viewport.name} (${viewport.width}x${viewport.height})`);
  
  // For browser environment
  if (typeof window !== 'undefined') {
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;
    
    // Resize window if possible (works in some testing environments)
    try {
      window.resizeTo(viewport.width, viewport.height);
    } catch (e) {
      console.warn('Could not resize window. This is expected in most browsers due to security restrictions.');
    }
    
    // Execute the test
    callback(viewport);
    
    // Restore original size
    try {
      window.resizeTo(originalWidth, originalHeight);
    } catch (e) {
      console.warn('Could not restore window size.');
    }
  } 
  // For testing frameworks like Cypress, Playwright, etc.
  else {
    // This would be implemented differently depending on the testing framework
    console.log('Window object not available. This function should be used in a browser environment or with a testing framework.');
  }
}

/**
 * Runs a test across all predefined device viewports
 * @param {Function} callback - Test function to run on each viewport
 */
function testAllViewports(callback) {
  Object.values(deviceViewports).forEach(viewport => {
    testViewport(viewport, callback);
  });
}

/**
 * Checks if elements are properly visible and not overlapping
 * @param {Array} selectors - Array of CSS selectors to check
 * @returns {Object} - Results of visibility tests
 */
function checkElementsVisibility(selectors) {
  if (typeof document === 'undefined') return {};
  
  const results = {};
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    results[selector] = {
      found: elements.length > 0,
      count: elements.length,
      allVisible: true,
      issues: []
    };
    
    elements.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      const styles = window.getComputedStyle(el);
      
      // Check if element is visible
      if (rect.width === 0 || rect.height === 0) {
        results[selector].allVisible = false;
        results[selector].issues.push(`Element #${index} has zero width or height`);
      }
      
      // Check if element is within viewport
      if (rect.right < 0 || rect.bottom < 0 || rect.left > window.innerWidth || rect.top > window.innerHeight) {
        results[selector].issues.push(`Element #${index} is outside viewport`);
      }
      
      // Check if text is too small to be readable (generally less than 12px)
      if (parseFloat(styles.fontSize) < 12) {
        results[selector].issues.push(`Element #${index} has font size less than 12px (${styles.fontSize})`);
      }
    });
  });
  
  return results;
}

export {
  deviceViewports,
  testViewport,
  testAllViewports,
  checkElementsVisibility
};
