import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CLCompLTradeoffMonitor = ({ 
  confidenceLevel, 
  complexityLevel,
  historicalData,
  onAdjustParameters 
}) => {
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    if (historicalData) {
      setHistory(historicalData);
    } else {
      // If no historical data provided, add current point
      setHistory(prevHistory => [
        ...prevHistory, 
        { 
          timestamp: new Date().toISOString(), 
          cl: confidenceLevel,
          compL: complexityLevel
        }
      ].slice(-20)); // Keep last 20 points
    }
  }, [confidenceLevel, complexityLevel, historicalData]);

  const chartData = {
    labels: history.map((_, index) => `T-${history.length - index}`),
    datasets: [
      {
        label: 'Confidence Level',
        data: history.map(point => point.cl),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Complexity Level',
        data: history.map(point => point.compL),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'CL-CompL Trade-off Monitor'
      }
    }
  };

  const handleParamChange = (param, value) => {
    onAdjustParameters({ [param]: value });
  };

  return (
    <div className="cl-compl-monitor">
      <div className="current-metrics">
        <div className="metric-display">
          <h3>Current Trade-off Values</h3>
          <div className="metric-values">
            <div className="metric">
              <span>Confidence Level:</span>
              <strong>{confidenceLevel.toFixed(2)}%</strong>
            </div>
            <div className="metric">
              <span>Complexity Level:</span>
              <strong>{complexityLevel.toFixed(2)}%</strong>
            </div>
          </div>
        </div>

        <div className="parameter-controls">
          <h3>Adjust Parameters</h3>
          <div className="slider-control">
            <label>Precision Factor</label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="1" 
              defaultValue="5"
              onChange={(e) => handleParamChange('precisionFactor', parseInt(e.target.value))} 
            />
          </div>
          <div className="slider-control">
            <label>Complexity Threshold</label>
            <input 
              type="range" 
              min="10" 
              max="90" 
              step="5" 
              defaultValue="50"
              onChange={(e) => handleParamChange('complexityThreshold', parseInt(e.target.value))} 
            />
          </div>
        </div>
      </div>

      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default CLCompLTradeoffMonitor;
