/**
 * Balance indicator functions for CL-CompL trade-off visualization
 */

// Define the function globally first
window.updateBalanceIndicator = function(metrics = {}) {
  // Default values if metrics not provided
  const cl = metrics.confidenceLevel || 50;
  const compL = metrics.complexityLevel || 50;
  
  // Calculate the balance ratio (0-100 where 50 is perfect balance)
  const ratio = Math.min(100, Math.max(0, 50 + ((cl - compL) / 2)));

  // Wait for DOM elements to be ready before manipulating them
  document.addEventListener('DOMContentLoaded', function() {
      const indicator = document.getElementById('balance-indicator');
      const statusText = document.getElementById('balance-status-text');
      
      if (!indicator || !statusText) {
        return; 
      }

      // Update the indicator position
      indicator.style.left = `${ratio}%`;
      
      // Update status text based on the balance
      let status = '';
      let statusClass = '';
      
      if (ratio < 30) {
        status = 'CompL dominante (Alta carga computacional)';
        statusClass = 'compl-dominant';
      } else if (ratio < 45) {
        status = 'Tendência para CompL';
        statusClass = 'compl-leaning';
      } else if (ratio > 70) {
        status = 'CL dominante (Alta carga cognitiva)';
        statusClass = 'cl-dominant';
      } else if (ratio > 55) {
        status = 'Tendência para CL';
        statusClass = 'cl-leaning';
      } else {
        status = 'Equilíbrio ideal (H3)';
        statusClass = 'balanced';
      }
      
      // Update text and class
      statusText.textContent = status;
      
      // Remove previous status classes
      statusText.classList.remove('compl-dominant', 'compl-leaning', 'balanced', 'cl-leaning', 'cl-dominant');
      // Add current status class
      statusText.classList.add(statusClass);
      
      // Dispatch an event to notify other components about the balance update
      const event = new CustomEvent('balance-updated', { 
        detail: { 
          ratio,
          cl,
          compL,
          status,
          statusClass
        } 
      });
      document.dispatchEvent(event);
  }); // End DOMContentLoaded listener inside the function
};

// Make sure the function is loaded when the script executes
console.log("✅ Balance indicator functions defined successfully");

// Dispatch an event indicating the script and function are ready
document.dispatchEvent(new CustomEvent('balanceIndicatorReady'));
