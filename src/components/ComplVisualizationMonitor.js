/**
 * CompL Visualization Monitor
 * Displays update metrics and monitors visualization responsiveness
 */

import React, { useState, useEffect } from 'react';

const ComplVisualizationMonitor = ({ modelSwitcher, refreshRate = 1000 }) => {
  const [metrics, setMetrics] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState(false);
  
  useEffect(() => {
    if (!modelSwitcher) return;
    
    const intervalId = setInterval(() => {
      setMetrics(modelSwitcher.getUpdateMetrics());
    }, refreshRate);
    
    return () => clearInterval(intervalId);
  }, [modelSwitcher, refreshRate]);
  
  const toggleVisibility = () => setIsVisible(prev => !prev);
  const toggleDetails = () => setExpandedDetails(prev => !prev);
  
  if (!isVisible) {
    return (
      <button 
        className="compl-monitor-toggle"
        onClick={toggleVisibility}
        title="Show CompL Update Monitor"
      >
        📊
      </button>
    );
  }
  
  const lastMetric = metrics.length > 0 ? metrics[metrics.length - 1] : null;
  
  return (
    <div className="compl-visualization-monitor">
      <div className="monitor-header">
        <h3>CompL Update Monitor</h3>
        <button onClick={toggleVisibility}>Close</button>
      </div>
      
      {lastMetric ? (
        <div className="monitor-content">
          <div className="current-status">
            <div className="status-item">
              <span>Current model:</span>
              <strong>{lastMetric.newModel}</strong>
            </div>
            <div className="status-item">
              <span>Last update:</span>
              <strong>{lastMetric.totalUpdateTime.toFixed(2)}ms</strong>
              <span className={lastMetric.totalUpdateTime < 200 ? "status-good" : 
                             (lastMetric.totalUpdateTime < 500 ? "status-medium" : "status-slow")}>
                {lastMetric.totalUpdateTime < 200 ? "✓ Fast" : 
                 (lastMetric.totalUpdateTime < 500 ? "⚠ Medium" : "✗ Slow")}
              </span>
            </div>
          </div>
          
          <button 
            className="toggle-details-btn"
            onClick={toggleDetails}
          >
            {expandedDetails ? "Hide details" : "Show details"}
          </button>
          
          {expandedDetails && (
            <div className="metrics-details">
              <h4>Component Update Times</h4>
              <table>
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Update Time (ms)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lastMetric.componentUpdateTimes.map((comp, idx) => (
                    <tr key={idx}>
                      <td>{comp.componentId}</td>
                      <td>{comp.updateTime.toFixed(2)}</td>
                      <td className={comp.updateTime < 100 ? "status-good" : 
                                    (comp.updateTime < 300 ? "status-medium" : "status-slow")}>
                        {comp.updateTime < 100 ? "Fast" : 
                         (comp.updateTime < 300 ? "Medium" : "Slow")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <h4>Update History</h4>
              <div className="update-history">
                {metrics.slice(-5).reverse().map((metric, idx) => (
                  <div key={idx} className="history-item">
                    <span>{new Date(metric.timestamp).toLocaleTimeString()}</span>
                    <span>{metric.previousModel} → {metric.newModel}</span>
                    <span>{metric.totalUpdateTime.toFixed(2)}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="no-data">No model changes detected yet</div>
      )}
    </div>
  );
};

export default ComplVisualizationMonitor;
