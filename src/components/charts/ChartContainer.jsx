import React, { useState, useEffect, useRef } from 'react';
import '../../styles/chartReset.css';

const ChartContainer = ({ 
  children, 
  loading = false,
  error = null,
  height = 400,
  title = '',
  className = '',
  loadingMessage = 'Loading chart data...',
  errorMessage = 'Error loading chart data',
  onContainerReady = () => {}
}) => {
  const containerRef = useRef(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setContainerDimensions({ width: clientWidth, height: clientHeight });
      setIsReady(true);
      onContainerReady({ width: clientWidth, height: clientHeight });
    }
  }, []);

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setContainerDimensions({ width: clientWidth, height: clientHeight });
        onContainerReady({ width: clientWidth, height: clientHeight });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      className={`chart-container ${className} ${isReady ? 'loaded' : ''} ${loading ? 'loading' : ''}`}
      ref={containerRef} 
      style={{ height: `${height}px` }}
      data-dimensions={`${containerDimensions.width}×${containerDimensions.height}`}
    >
      {title && <h3 className="chart-title">{title}</h3>}
      
      {loading && (
        <div className="chart-loading">
          <div className="chart-loading-spinner"></div>
          <div className="chart-loading-text">{loadingMessage}</div>
        </div>
      )}
      
      {error && (
        <div className="chart-error">
          <div className="chart-error-icon">⚠️</div>
          <div className="chart-error-text">{errorMessage}</div>
          {typeof error === 'string' && <div className="chart-error-details">{error}</div>}
        </div>
      )}
      
      <div className="chart-content" style={{ opacity: loading ? 0.5 : 1 }}>
        {isReady && children(containerDimensions)}
      </div>
    </div>
  );
};

export default ChartContainer;
