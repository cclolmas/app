import React, { useState, useEffect } from 'react';
import ViolinPlotsChart from './ViolinPlotsChart';
import KdePlot from './KdePlot';
import { getMockClCompData } from '../utils/clCompMockData';
import '../styles/clCompDashboard.css';

const CognitiveComputationalDashboard = () => {
  // State for data and filters
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    expertiseLevel: 'all', // 'all', 'novice', 'intermediate', 'advanced'
    taskType: 'all', // 'all', 'qlora', 'lmas', etc.
    compMetric: 'vramUsage', // 'vramUsage', 'executionTime', 'modelSize'
    compCategories: 'quantization' // 'quantization', 'modelSize', 'executionTime'
  });
  
  // State for selected regions and points
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [drawMode, setDrawMode] = useState(false);
  
  // Load mock data
  useEffect(() => {
    const fetchData = async () => {
      const mockData = await getMockClCompData();
      setData(mockData);
    };
    
    fetchData();
  }, []);
  
  // Filter data based on current filters
  const getFilteredData = () => {
    return data.filter(item => {
      return (filters.expertiseLevel === 'all' || item.expertiseLevel === filters.expertiseLevel) &&
             (filters.taskType === 'all' || item.taskType === filters.taskType);
    });
  };
  
  // Handle region selection in KDE plot
  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    
    // Filter points based on selected region
    if (region) {
      const pointsInRegion = getFilteredData().filter(item => {
        return item[filters.compMetric] >= region.x1 && 
               item[filters.compMetric] <= region.x2 && 
               item.cognitiveLoad >= region.y1 && 
               item.cognitiveLoad <= region.y2;
      });
      setSelectedPoints(pointsInRegion);
    } else {
      setSelectedPoints([]);
    }
  };
  
  // Handle point selection in Violin plot
  const handlePointSelect = (points) => {
    setSelectedPoints(points);
    
    // Clear any selected region in KDE
    setSelectedRegion(null);
  };
  
  // Toggle draw mode for selecting regions of interest
  const toggleDrawMode = () => {
    setDrawMode(!drawMode);
    if (drawMode) {
      // Exiting draw mode, clear any incomplete selection
      setSelectedRegion(null);
    }
  };
  
  // Get category mapping based on selected metric
  const getCategoryMapping = () => {
    switch (filters.compCategories) {
      case 'quantization':
        return {
          'q4': 'Q4 Quantization',
          'q8': 'Q8 Quantization',
          'f16': 'FP16 (No Quant)'
        };
      case 'modelSize':
        return {
          'small': 'Small Model (<7B)',
          'medium': 'Medium Model (7-13B)',
          'large': 'Large Model (>13B)'
        };
      case 'executionTime':
        return {
          'fast': 'Fast (<5s)',
          'medium': 'Medium (5-20s)',
          'slow': 'Slow (>20s)'
        };
      default:
        return {};
    }
  };

  return (
    <div className="cl-comp-dashboard">
      <h1>Cognitive-Computational Load Relationship</h1>
      <p className="dashboard-description">
        Explore how cognitive load relates to computational resource constraints, and identify optimal 
        operating points that balance both dimensions.
      </p>
      
      <div className="dashboard-controls">
        <div className="control-group">
          <label htmlFor="expertise-filter">Expertise Level:</label>
          <select 
            id="expertise-filter" 
            value={filters.expertiseLevel}
            onChange={(e) => setFilters({...filters, expertiseLevel: e.target.value})}
          >
            <option value="all">All Levels</option>
            <option value="novice">Novice</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="task-filter">Task Type:</label>
          <select 
            id="task-filter"
            value={filters.taskType}
            onChange={(e) => setFilters({...filters, taskType: e.target.value})}
          >
            <option value="all">All Tasks</option>
            <option value="qlora">QLoRA Fine-tuning</option>
            <option value="lmas">LMAS Orchestration</option>
            <option value="inference">Inference</option>
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="comp-metric">Computational Metric:</label>
          <select 
            id="comp-metric"
            value={filters.compMetric}
            onChange={(e) => setFilters({...filters, compMetric: e.target.value})}
          >
            <option value="vramUsage">VRAM Usage (GB)</option>
            <option value="executionTime">Execution Time (s)</option>
            <option value="modelSize">Model Size (B params)</option>
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="comp-categories">Category Grouping:</label>
          <select 
            id="comp-categories"
            value={filters.compCategories}
            onChange={(e) => setFilters({...filters, compCategories: e.target.value})}
          >
            <option value="quantization">Quantization Level</option>
            <option value="modelSize">Model Size</option>
            <option value="executionTime">Execution Time</option>
          </select>
        </div>
        
        <div className="control-group">
          <button 
            className={`draw-mode-btn ${drawMode ? 'active' : ''}`}
            onClick={toggleDrawMode}
          >
            {drawMode ? 'Exit Draw Mode' : 'Draw Region of Interest'}
          </button>
        </div>
      </div>
      
      <div className="visualizations-container">
        <div className="kde-container">
          <h2>Cognitive-Computational Load Distribution</h2>
          <KdePlot 
            data={getFilteredData()}
            selectedPoints={selectedPoints}
            selectedRegion={selectedRegion}
            compMetric={filters.compMetric}
            drawMode={drawMode}
            onRegionSelect={handleRegionSelect}
          />
          <div className="visualization-legend">
            <div className="legend-item">
              <div className="legend-color" style={{background: 'rgba(255, 0, 0, 0.3)'}}></div>
              <span>H1: High CL with Optimized CompL</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{background: 'rgba(0, 255, 0, 0.3)'}}></div>
              <span>H3: Optimal Cognitive-Computational Efficiency</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{background: 'rgba(0, 0, 255, 0.3)'}}></div>
              <span>H4: Expertise Reversal Zone</span>
            </div>
          </div>
        </div>
        
        <div className="violin-container">
          <h2>Cognitive Load by {getCategoryMapping()[Object.keys(getCategoryMapping())[0]]}</h2>
          <ViolinPlotsChart 
            data={getFilteredData()}
            selectedPoints={selectedPoints}
            categoryMapping={getCategoryMapping()}
            categoryKey={filters.compCategories}
            onPointSelect={handlePointSelect}
          />
        </div>
      </div>
      
      <div className="hypothesis-panel">
        <h3>Hypothesis Evidence</h3>
        <ul>
          <li>
            <strong>H1:</strong> More optimized computation may lead to higher cognitive load 
            (visible in higher CL distributions for Q4 compared to Q8).
          </li>
          <li>
            <strong>H3:</strong> There exists an optimal point of cognitive-computational efficiency 
            (visible in the KDE plot as density hotspots).
          </li>
          <li>
            <strong>H4:</strong> Expertise reverses the relationship between computational load and cognitive load 
            (toggle expertise filter to observe differences).
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CognitiveComputationalDashboard;
