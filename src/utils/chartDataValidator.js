/**
 * Chart Data Validator
 * Ensures data structures match what chart components expect
 */

/**
 * Validates data structure for Chart.js
 * @param {Object} data - The data object to validate
 * @param {string} chartType - Type of chart ('bar', 'line', 'radar', 'doughnut')
 * @return {Object} Result with validation status and any errors
 */
export function validateChartJsData(data, chartType) {
  const errors = [];
  let isValid = true;
  
  // Check basic structure
  if (!data) {
    return { 
      isValid: false, 
      errors: ['Data is undefined or null']
    };
  }
  
  // Common validations for most Chart.js charts
  if (!data.labels || !Array.isArray(data.labels)) {
    errors.push('Missing "labels" array');
    isValid = false;
  }
  
  if (!data.datasets || !Array.isArray(data.datasets)) {
    errors.push('Missing "datasets" array');
    isValid = false;
  } else {
    // Check each dataset
    data.datasets.forEach((dataset, index) => {
      if (!dataset.data || !Array.isArray(dataset.data)) {
        errors.push(`Dataset ${index} is missing "data" array`);
        isValid = false;
      }
      
      if (!dataset.label) {
        errors.push(`Dataset ${index} is missing "label" property`);
      }
      
      // Type-specific validations
      switch (chartType) {
        case 'bar':
        case 'line':
          // These require backgroundColor/borderColor
          if (!dataset.backgroundColor) {
            errors.push(`Dataset ${index} is missing "backgroundColor"`);
          }
          break;
          
        case 'radar':
          // These often require fill attributes
          if (dataset.data.length !== data.labels.length) {
            errors.push(`Dataset ${index} data length doesn't match labels length`);
            isValid = false;
          }
          break;
          
        case 'doughnut':
        case 'pie':
          // These require backgroundColor as array
          if (!Array.isArray(dataset.backgroundColor)) {
            errors.push(`Dataset ${index} "backgroundColor" should be an array`);
          }
          break;
      }
    });
  }
  
  return { isValid, errors };
}

/**
 * Validates data structure for D3.js visualizations
 * @param {Object} data - The data to validate
 * @param {string} vizType - Type of visualization 
 * @return {Object} Result with validation status and any errors
 */
export function validateD3Data(data, vizType) {
  const errors = [];
  let isValid = true;
  
  if (!data) {
    return { 
      isValid: false, 
      errors: ['Data is undefined or null']
    };
  }
  
  switch (vizType) {
    case 'sankey':
      if (!data.nodes || !Array.isArray(data.nodes)) {
        errors.push('Sankey diagram missing "nodes" array');
        isValid = false;
      }
      
      if (!data.links || !Array.isArray(data.links)) {
        errors.push('Sankey diagram missing "links" array');
        isValid = false;
      } else if (data.nodes) {
        // Check that links reference valid nodes
        data.links.forEach((link, index) => {
          if (typeof link.source !== 'number' || link.source >= data.nodes.length) {
            errors.push(`Link ${index} has invalid source reference`);
            isValid = false;
          }
          if (typeof link.target !== 'number' || link.target >= data.nodes.length) {
            errors.push(`Link ${index} has invalid target reference`);
            isValid = false;
          }
        });
      }
      break;
      
    case 'barChart':
      // For D3 bar charts
      if (!Array.isArray(data)) {
        errors.push('Bar chart data should be an array of objects');
        isValid = false;
      } else if (data.length > 0) {
        const requiredProps = ['category', 'count'];
        requiredProps.forEach(prop => {
          if (data[0][prop] === undefined) {
            errors.push(`Data items missing required property: ${prop}`);
            isValid = false;
          }
        });
      }
      break;
  }
  
  return { isValid, errors };
}

/**
 * Fixes common data structure issues
 * @param {Object} data - The data to fix
 * @param {string} chartType - Type of chart
 * @return {Object} Fixed data
 */
export function fixChartData(data, chartType) {
  if (!data) return null;
  
  let fixedData = JSON.parse(JSON.stringify(data)); // Clone data
  
  // Create basic structure if missing
  if (!fixedData.labels) fixedData.labels = [];
  if (!fixedData.datasets) fixedData.datasets = [];
  
  // Ensure each dataset has required properties
  fixedData.datasets = fixedData.datasets.map(dataset => {
    const fixed = { ...dataset };
    if (!fixed.data) fixed.data = [];
    if (!fixed.label) fixed.label = 'Dataset';
    
    // Add missing visual properties
    switch (chartType) {
      case 'bar':
      case 'line':
        if (!fixed.backgroundColor) {
          fixed.backgroundColor = 'rgba(54, 162, 235, 0.5)';
        }
        if (!fixed.borderColor) {
          fixed.borderColor = 'rgb(54, 162, 235)';
        }
        break;
      
      case 'radar':
        if (!fixed.backgroundColor) {
          fixed.backgroundColor = 'rgba(54, 162, 235, 0.2)';
        }
        break;
    }
    
    return fixed;
  });
  
  return fixedData;
}
