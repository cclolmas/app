import React, { useEffect, useRef } from 'react';
import '../../styles/chartReset.css';

/**
 * Higher-order component that wraps chart components
 * to provide consistent container sizing and debugging
 */
const withChartContainer = (WrappedComponent, options = {}) => {
  const {
    height = 400,
    minHeight = 200,
    enableDebug = process.env.NODE_ENV !== 'production',
    className = '',
    containerStyle = {}
  } = options;

  const WithChartContainer = (props) => {
    const containerRef = useRef(null);
    
    useEffect(() => {
      if (enableDebug && containerRef.current) {
        const container = containerRef.current;
        const dimensions = {
          width: container.clientWidth,
          height: container.clientHeight
        };
        
        if (dimensions.width === 0 || dimensions.height === 0) {
          console.error('Chart container has zero dimensions:', dimensions);
          container.setAttribute('data-debug-issue', `${dimensions.width}×${dimensions.height}`);
        } else {
          console.log('Chart container dimensions:', dimensions);
        }
      }
    }, []);
    
    return (
      <div 
        className={`chart-container ${className}`}
        ref={containerRef}
        style={{ 
          height: `${height}px`, 
          minHeight: `${minHeight}px`,
          ...containerStyle
        }}
      >
        <WrappedComponent {...props} containerRef={containerRef} />
      </div>
    );
  };
  
  WithChartContainer.displayName = `WithChartContainer(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;
  
  return WithChartContainer;
};

export default withChartContainer;
