/**
 * Visualization Wrapper HOC
 * Wraps CompL visualizations to monitor and measure their update performance
 */

import React, { useRef, useEffect, useState } from 'react';

/**
 * Higher Order Component to track visualization updates
 */
export const withUpdateTracking = (WrappedComponent, options = {}) => {
  const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const TrackedComponent = React.forwardRef((props, ref) => {
    const { modelSwitcher, ...restProps } = props;
    const componentRef = useRef(null);
    const lastUpdateRef = useRef(null);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Create a consistent ID for the component
    const idRef = useRef(`${componentName}-${Math.random().toString(36).substr(2, 9)}`);
    
    useEffect(() => {
      if (!modelSwitcher) return;
      
      // Create an API for the component that the model switcher can interact with
      const componentApi = {
        id: idRef.current,
        onModelChanged: async (prevModel, newModel) => {
          setIsUpdating(true);
          lastUpdateRef.current = performance.now();
          
          // Let the component handle its own update first
          if (componentRef.current && componentRef.current.onModelChanged) {
            await componentRef.current.onModelChanged(prevModel, newModel);
          }
          
          // Force a small delay to ensure the component has actually updated
          await new Promise(resolve => setTimeout(resolve, 10));
          
          setIsUpdating(false);
          modelSwitcher.notifyComponentUpdated(componentApi);
        },
        setLoadingState: (isLoading) => {
          setIsUpdating(isLoading);
        }
      };
      
      // Register with the model switcher
      modelSwitcher.registerVisualComponent(componentApi);
    }, [modelSwitcher]);
    
    return (
      <div className={`compl-viz-container ${isUpdating ? 'updating' : ''}`}>
        {isUpdating && (
          <div className="compl-viz-updating-overlay">
            <div className="spinner"></div>
          </div>
        )}
        <WrappedComponent
          ref={(instance) => {
            // Handle both React.forwardRef and regular refs
            componentRef.current = instance;
            if (typeof ref === 'function') {
              ref(instance);
            } else if (ref) {
              ref.current = instance;
            }
          }}
          {...restProps}
        />
        {options.showDebugInfo && (
          <div className="compl-viz-debug">
            <span>ID: {idRef.current}</span>
            <span>Last update: {lastUpdateRef.current ? new Date(lastUpdateRef.current).toLocaleTimeString() : 'Never'}</span>
          </div>
        )}
      </div>
    );
  });
  
  TrackedComponent.displayName = `withUpdateTracking(${componentName})`;
  return TrackedComponent;
};

/**
 * Factory function to create a monitor-ready visualization component
 */
export function createTrackedVisualization(VisualizationComponent, options = {}) {
  return withUpdateTracking(VisualizationComponent, options);
}
