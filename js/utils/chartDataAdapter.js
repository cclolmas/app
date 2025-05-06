/**
 * Chart Data Adapter
 * Utility to format data to match expected structures for different chart libraries
 */

const ChartDataAdapter = {
  // Adapter for Chart.js Bar/Histogram charts
  forChartJsBar(rawData, options = {}) {
    if (!rawData) {
      console.warn('No data provided to forChartJsBar adapter');
      return this.getDefaultBarData();
    }
    
    // If data is already in the right format, return it
    if (rawData.datasets && rawData.labels) {
      return rawData;
    }
    
    return this.getDefaultBarData();
  },
  
  // Adapter for Recharts Sankey diagrams
  forRechartsSankey(rawData) {
    if (!rawData) {
      console.warn('No data provided to forRechartsSankey adapter');
      return this.getDefaultSankeyData();
    }
    
    // Handle data that's nested inside a property
    if (rawData.computationFlow && rawData.computationFlow.nodes && rawData.computationFlow.links) {
      return this.validateSankeyData(rawData.computationFlow);
    }
    
    // If data looks like Sankey data
    if (rawData.nodes && rawData.links) {
      return this.validateSankeyData(rawData);
    }
    
    console.warn('Unable to adapt data to Sankey format', rawData);
    return this.getDefaultSankeyData();
  },
  
  // Make sure Sankey data is properly formatted
  validateSankeyData(data) {
    if (!Array.isArray(data.nodes) || !Array.isArray(data.links)) {
      console.warn('Sankey data has incorrect nodes or links format', data);
      return this.getDefaultSankeyData();
    }
    
    // Convert string IDs to numeric indices if needed
    const nodeMap = {};
    data.nodes.forEach((node, index) => {
      nodeMap[node.id || node.name || index] = index;
    });
    
    // Ensure links use numeric indices
    const processedLinks = data.links.map(link => {
      const sourceIndex = typeof link.source === 'string' ? nodeMap[link.source] : link.source;
      const targetIndex = typeof link.target === 'string' ? nodeMap[link.target] : link.target;
      
      if (sourceIndex === undefined || targetIndex === undefined) {
        console.warn('Invalid link source/target', link);
        return null;
      }
      
      return {
        ...link,
        source: sourceIndex,
        target: targetIndex,
        value: link.value || 1
      };
    }).filter(link => link !== null);
    
    return {
      nodes: data.nodes,
      links: processedLinks
    };
  },
  
  // Default placeholders when data is missing
  getDefaultBarData() {
    return {
      labels: ['No Data'],
      datasets: [{
        label: 'No Data Available',
        data: [0],
        backgroundColor: 'rgba(200, 200, 200, 0.5)'
      }]
    };
  },
  
  getDefaultSankeyData() {
    return {
      nodes: [
        { name: 'No Data' },
        { name: 'Available' }
      ],
      links: [
        { source: 0, target: 1, value: 1 }
      ]
    };
  }
};

// Make it globally accessible
window.ChartDataAdapter = ChartDataAdapter;

export default ChartDataAdapter;
