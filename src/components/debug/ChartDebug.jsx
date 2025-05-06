import React, { useState, useEffect } from 'react';
import { validateChartJsData, validateD3Data } from '../../utils/chartDataValidator';

const ChartDebug = ({ data, chartType, containerRef, library = 'chartjs' }) => {
  const [validationResult, setValidationResult] = useState(null);
  const [containerInfo, setContainerInfo] = useState(null);
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    // Validate data structure
    const result = library === 'chartjs' 
      ? validateChartJsData(data, chartType)
      : validateD3Data(data, chartType);
    
    setValidationResult(result);
    
    // Check container
    if (containerRef && containerRef.current) {
      const container = containerRef.current;
      const styles = window.getComputedStyle(container);
      
      setContainerInfo({
        width: container.clientWidth,
        height: container.clientHeight,
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        position: styles.position,
        overflow: styles.overflow
      });
    }
  }, [data, chartType, containerRef, library]);

  if (!validationResult) return null;
  
  const hasErrors = !validationResult.isValid || 
    (containerInfo && (containerInfo.width === 0 || containerInfo.height === 0));
    
  const debugStyle = {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: hasErrors ? 'rgba(255,0,0,0.9)' : 'rgba(0,128,0,0.9)',
    color: 'white',
    padding: expanded ? '10px' : '5px',
    fontSize: '12px',
    borderRadius: '3px',
    zIndex: 1000,
    cursor: 'pointer',
    maxWidth: expanded ? '400px' : 'auto',
    maxHeight: expanded ? '300px' : 'auto',
    overflow: 'auto'
  };
  
  return (
    <div 
      style={debugStyle} 
      onClick={() => setExpanded(!expanded)}
    >
      {!expanded && (hasErrors ? '⚠️' : '✅')}
      
      {expanded && (
        <div>
          <h4>Chart Debug Info</h4>
          
          <div>
            <strong>Chart Type:</strong> {chartType}<br />
            <strong>Library:</strong> {library}<br />
            <strong>Valid Data:</strong> {validationResult.isValid ? 'Yes' : 'No'}
          </div>
          
          {validationResult.errors && validationResult.errors.length > 0 && (
            <div>
              <strong>Errors:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {validationResult.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {containerInfo && (
            <div>
              <strong>Container:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>Width: {containerInfo.width}px</li>
                <li>Height: {containerInfo.height}px</li>
                <li>Display: {containerInfo.display}</li>
                <li>Visibility: {containerInfo.visibility}</li>
                <li>Overflow: {containerInfo.overflow}</li>
              </ul>
            </div>
          )}
          
          {containerInfo && (containerInfo.width === 0 || containerInfo.height === 0) && (
            <div style={{ color: 'yellow', fontWeight: 'bold' }}>
              Container has zero dimensions!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChartDebug;
