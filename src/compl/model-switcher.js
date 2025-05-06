/**
 * CompL Model Switcher
 * Handles model changes and measures impact on visualization updates
 */

class ComplModelSwitcher {
  constructor(options = {}) {
    this.currentModel = null;
    this.visualComponents = [];
    this.updateMetrics = [];
    this.options = {
      logPerformance: true,
      visualFeedback: true,
      ...options
    };
  }

  /**
   * Register visualization components to be monitored
   */
  registerVisualComponent(component) {
    this.visualComponents.push({
      component,
      lastUpdateTime: null
    });
    return this;
  }

  /**
   * Switch to a different CompL model
   */
  async switchModel(newModel) {
    const startTime = performance.now();
    
    // Record pre-update state
    this._markComponentsForUpdate();
    
    // Apply visual indicators if enabled
    if (this.options.visualFeedback) {
      this._applyLoadingState(true);
    }
    
    try {
      // Perform actual model switch
      const prevModel = this.currentModel;
      this.currentModel = newModel;
      
      // Notify all registered components about model change
      const updatePromise = this._notifyComponents(prevModel, newModel);
      
      // Wait for updates to complete
      await updatePromise;
      
      // Calculate performance metrics
      const endTime = performance.now();
      const updateTime = endTime - startTime;
      
      this._recordMetrics({
        previousModel: prevModel?.name || 'none',
        newModel: newModel.name,
        totalUpdateTime: updateTime,
        componentUpdateTimes: this._getComponentUpdateTimes()
      });
      
      return {
        success: true,
        updateTime,
        metrics: this.updateMetrics[this.updateMetrics.length - 1]
      };
    } finally {
      // Remove loading indicators
      if (this.options.visualFeedback) {
        this._applyLoadingState(false);
      }
    }
  }

  /**
   * Private: Mark components to track their update times
   */
  _markComponentsForUpdate() {
    this.visualComponents.forEach(comp => {
      comp.updateStartTime = performance.now();
      comp.updateCompleted = false;
    });
  }

  /**
   * Private: Apply loading state to components
   */
  _applyLoadingState(isLoading) {
    this.visualComponents.forEach(({component}) => {
      if (typeof component.setLoadingState === 'function') {
        component.setLoadingState(isLoading);
      }
    });
  }

  /**
   * Private: Notify components about model change
   */
  async _notifyComponents(prevModel, newModel) {
    const updatePromises = this.visualComponents.map(async ({component}) => {
      if (typeof component.onModelChanged === 'function') {
        return component.onModelChanged(prevModel, newModel);
      }
    });
    
    return Promise.all(updatePromises);
  }

  /**
   * Private: Get update times for all components
   */
  _getComponentUpdateTimes() {
    return this.visualComponents.map(comp => ({
      componentId: comp.component.id || 'unknown',
      updateTime: comp.lastUpdateTime - comp.updateStartTime
    }));
  }

  /**
   * Private: Record metrics about the update
   */
  _recordMetrics(metrics) {
    this.updateMetrics.push({
      ...metrics,
      timestamp: new Date().toISOString()
    });
    
    if (this.options.logPerformance) {
      console.log(`CompL model change: ${metrics.previousModel} → ${metrics.newModel}`);
      console.log(`Total update time: ${metrics.totalUpdateTime.toFixed(2)}ms`);
    }
  }

  /**
   * Component calls this when its update is complete
   */
  notifyComponentUpdated(component) {
    const compInfo = this.visualComponents.find(c => c.component === component);
    if (compInfo) {
      compInfo.lastUpdateTime = performance.now();
      compInfo.updateCompleted = true;
    }
  }

  /**
   * Get performance history
   */
  getUpdateMetrics() {
    return [...this.updateMetrics];
  }
}

export default ComplModelSwitcher;
