/**
 * Chart Data Adapter
 * Helps convert and validate data for different chart libraries
 */

class ChartDataAdapter {
  /**
   * Convert data for Recharts Sankey diagram
   * @param {Object} rawData - Raw data with nodes and links
   * @returns {Object} - Formatted data for Recharts
   */
  static forRechartsSankey(rawData) {
    // Validate input
    if (!rawData || !rawData.nodes || !rawData.links || 
        !Array.isArray(rawData.nodes) || !Array.isArray(rawData.links)) {
      throw new Error('Dados inválidos para o diagrama Sankey');
    }
    
    // Format nodes with required properties
    const nodes = rawData.nodes.map(node => {
      return {
        name: node.name || node.id || 'Unnamed node',
        ...node
      };
    });
    
    // Format links with required properties
    const links = rawData.links.map(link => {
      return {
        source: link.source,
        target: link.target,
        value: link.value || 1,
        ...link
      };
    });
    
    return { nodes, links };
  }
  
  /**
   * Validate chart data structure
   * @param {Object} data - Data to validate
   * @param {string} chartType - Type of chart for specific validation
   * @returns {Object} - Validation result with isValid flag and message
   */
  static validate(data, chartType) {
    if (!data) {
      return { isValid: false, message: 'Dados não fornecidos' };
    }
    
    switch (chartType) {
      case 'sankey':
        if (!data.nodes || !Array.isArray(data.nodes) || data.nodes.length === 0) {
          return { 
            isValid: false, 
            message: 'Sankey requer um array de nós não-vazio'
          };
        }
        if (!data.links || !Array.isArray(data.links)) {
          return { 
            isValid: false, 
            message: 'Sankey requer um array de links'
          };
        }
        // Check that all links reference valid nodes
        const nodeIds = new Set(data.nodes.map(n => n.id || n.name));
        for (const link of data.links) {
          if (!nodeIds.has(link.source)) {
            return { 
              isValid: false, 
              message: `Link referencia nó de origem inexistente: ${link.source}`
            };
          }
          if (!nodeIds.has(link.target)) {
            return { 
              isValid: false, 
              message: `Link referencia nó de destino inexistente: ${link.target}`
            };
          }
        }
        break;
      
      // Add more chart type validations as needed
    }
    
    return { isValid: true };
  }
}

// Make this available globally
window.ChartDataAdapter = ChartDataAdapter;
