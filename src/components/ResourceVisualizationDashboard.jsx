import React, { useState, useEffect } from 'react';
import ResourceConsumptionChart from './ResourceConsumptionChart';
import ComputationalFlowDiagram from './ComputationalFlowDiagram';
import ResourceControlPanel from './ResourceControlPanel';
import { getResourceData, getFlowData } from '../utils/resourceMockData';
import '../styles/resourceVisualization.css';

const ResourceVisualizationDashboard = () => {
  // State for user-selected configuration
  const [config, setConfig] = useState({
    model: 'mistral-7b',
    quantization: 'q4',
    batchSize: 1,
    taskType: 'fine-tuning',
    agents: 1,
    datasetSize: 'small'
  });
  
  // States for visualization data
  const [resourceData, setResourceData] = useState([]);
  const [flowData, setFlowData] = useState({ nodes: [], links: [] });
  const [comparisonConfig, setComparisonConfig] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparisonFlowData, setComparisonFlowData] = useState(null);
  const [viewType, setViewType] = useState('absolute'); // 'absolute' or 'percentage'
  const [sortBy, setSortBy] = useState('total'); // 'total', 'vram', 'time', etc.

  // Update data when configuration changes
  useEffect(() => {
    // Get updated data based on current configuration
    const newResourceData = getResourceData(config);
    const newFlowData = getFlowData(config);
    
    setResourceData(newResourceData);
    setFlowData(newFlowData);
    
    // Update comparison data if it exists
    if (comparisonConfig) {
      const newComparisonData = getResourceData(comparisonConfig);
      const newComparisonFlowData = getFlowData(comparisonConfig);
      setComparisonData(newComparisonData);
      setComparisonFlowData(newComparisonFlowData);
    }
  }, [config, comparisonConfig]);

  // Handle configuration changes from control panel
  const handleConfigChange = (newConfig) => {
    setConfig(newConfig);
  };

  // Handle adding/removing comparison configuration
  const toggleComparison = (compConfig = null) => {
    if (compConfig) {
      setComparisonConfig(compConfig);
    } else {
      setComparisonConfig(null);
      setComparisonData(null);
      setComparisonFlowData(null);
    }
  };

  return (
    <div className="resource-visualization-dashboard">
      <h1>Computational Resource Visualization</h1>
      <p className="dashboard-description">
        Explore how different model configurations and parameters affect computational 
        resource usage in LLM fine-tuning and inference tasks.
      </p>
      
      <ResourceControlPanel 
        config={config} 
        onConfigChange={handleConfigChange} 
        onComparisonToggle={toggleComparison}
        comparisonConfig={comparisonConfig}
      />
      
      <div className="visualization-container">
        <div className="chart-section">
          <h2>Resource Consumption</h2>
          <div className="chart-controls">
            <div className="control-group">
              <label htmlFor="view-type">View:</label>
              <select 
                id="view-type" 
                value={viewType} 
                onChange={(e) => setViewType(e.target.value)}
              >
                <option value="absolute">Absolute Values</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
            
            <div className="control-group">
              <label htmlFor="sort-by">Sort By:</label>
              <select 
                id="sort-by" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="total">Total Resource Usage</option>
                <option value="vram">VRAM Usage</option>
                <option value="time">Processing Time</option>
                <option value="ram">RAM Usage</option>
              </select>
            </div>
          </div>
          
          <ResourceConsumptionChart 
            data={resourceData}
            comparisonData={comparisonData}
            viewType={viewType}
            sortBy={sortBy}
          />
        </div>
        
        <div className="diagram-section">
          <h2>Computational Flow</h2>
          <ComputationalFlowDiagram 
            data={flowData}
            comparisonData={comparisonFlowData}
            config={config}
            comparisonConfig={comparisonConfig}
          />
        </div>
      </div>
      
      <div className="dashboard-footer">
        <p>Based on LLMOps resource optimization principles (Pahune & Akhtar, 2025) and efficient deployment practices (Bai et al., 2024)</p>
      </div>
    </div>
  );
};

export default ResourceVisualizationDashboard;
