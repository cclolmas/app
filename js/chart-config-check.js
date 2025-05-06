/**
 * Chart Configuration Validation
 */

// Verify Chart.js registration
function verifyChartJsRegistration() {
  if (typeof Chart === 'undefined') {
    console.error('Chart.js is not loaded');
    return false;
  }
  
  // Check what components are registered
  const expectedComponents = [
    'CategoryScale', 'LinearScale', 'BarElement', 
    'PointElement', 'LineElement', 'ArcElement',
    'RadialLinearScale'
  ];
  
  const registeredComponents = Object.keys(Chart.registry.controllers);
  
  console.log('Registered Chart.js components:');
  console.table(registeredComponents);
  
  const missingComponents = expectedComponents.filter(comp => 
    !registeredComponents.includes(comp));
    
  if (missingComponents.length > 0) {
    console.warn('Missing Chart.js components:', missingComponents);
  }
  
  return missingComponents.length === 0;
}

// Check for style conflicts
function checkStyleConflicts() {
  // Find all chart containers
  const containers = document.querySelectorAll('.chart-container');
  
  const results = Array.from(containers).map(container => {
    const styles = window.getComputedStyle(container);
    return {
      id: container.id || 'unnamed',
      height: styles.height,
      width: styles.width,
      position: styles.position,
      display: styles.display,
      overflow: styles.overflow,
      visibility: styles.visibility,
      opacity: styles.opacity,
      zIndex: styles.zIndex
    };
  });
  
  console.log('Chart container styles:');
  console.table(results);
  
  // Look for problematic values
  const problems = results.filter(r => 
    r.height === '0px' || r.width === '0px' || 
    r.display === 'none' || r.visibility === 'hidden' ||
    r.opacity === '0');
    
  if (problems.length > 0) {
    console.error('Found containers with problematic styles:', problems);
    return false;
  }
  
  return true;
}

// Expose functions
window.chartConfigCheck = {
  verifyChartJsRegistration,
  checkStyleConflicts
};
