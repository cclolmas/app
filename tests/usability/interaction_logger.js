/**
 * Interaction Logger for CL-CompL Usability Tests
 * 
 * This script logs user interactions with the visualizations to help
 * analyze how users navigate and interpret the visualizations.
 */

class InteractionLogger {
  constructor(userId, sessionId) {
    this.userId = userId;
    this.sessionId = sessionId;
    this.startTime = Date.now();
    this.events = [];
    this.currentTask = null;
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners for various user interactions
   */
  setupEventListeners() {
    // Track visualization clicks
    document.querySelectorAll('.visualization').forEach(viz => {
      viz.addEventListener('click', (event) => {
        this.logEvent('click', {
          visualization: viz.dataset.vizId,
          x: event.offsetX,
          y: event.offsetY,
          target: event.target.tagName,
          elementId: event.target.id || null
        });
      });
      
      // Track hover events
      viz.addEventListener('mousemove', this.debounce((event) => {
        this.logEvent('hover', {
          visualization: viz.dataset.vizId,
          x: event.offsetX,
          y: event.offsetY,
          target: event.target.tagName,
          elementId: event.target.id || null
        });
      }, 100));
    });
    
    // Track control interactions (filters, dropdowns, etc.)
    document.querySelectorAll('.control').forEach(control => {
      control.addEventListener('change', (event) => {
        this.logEvent('control_change', {
          controlId: control.id,
          controlType: control.type,
          value: control.value
        });
      });
    });
    
    // Track view switches
    document.querySelectorAll('.view-switch').forEach(btn => {
      btn.addEventListener('click', (event) => {
        this.logEvent('view_switch', {
          fromView: document.querySelector('.active-view')?.dataset.viewId,
          toView: btn.dataset.targetView
        });
      });
    });
    
    // Track scrolling behavior
    window.addEventListener('scroll', this.debounce(() => {
      this.logEvent('scroll', {
        scrollX: window.scrollX,
        scrollY: window.scrollY
      });
    }, 200));
  }
  
  /**
   * Start logging for a specific task
   * @param {string} taskId - ID of the current task
   */
  startTask(taskId) {
    this.currentTask = taskId;
    this.logEvent('task_start', { taskId });
  }
  
  /**
   * End logging for the current task
   * @param {Object} results - Task completion results
   */
  endTask(results) {
    this.logEvent('task_end', { 
      taskId: this.currentTask,
      completed: results.completed,
      timeSpent: results.timeSpent,
      success: results.success
    });
    this.currentTask = null;
  }
  
  /**
   * Log a user event
   * @param {string} eventType - Type of event
   * @param {Object} details - Event details
   */
  logEvent(eventType, details = {}) {
    this.events.push({
      timestamp: Date.now(),
      timeFromStart: Date.now() - this.startTime,
      eventType,
      taskId: this.currentTask,
      details
    });
  }
  
  /**
   * Add a comment or observation
   * @param {string} comment - Comment text
   * @param {Object} context - Additional context
   */
  addComment(comment, context = {}) {
    this.logEvent('comment', {
      text: comment,
      ...context
    });
  }
  
  /**
   * Create a debounced function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  /**
   * Export all logged events
   * @returns {Object} Session log data
   */
  exportLogs() {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      events: this.events
    };
  }
  
  /**
   * Save logs to server
   * @returns {Promise} Promise resolving to server response
   */
  saveLogs() {
    return fetch('/api/usability-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.exportLogs())
    })
    .then(response => response.json())
    .then(data => {
      console.log('Logs saved successfully:', data);
      return data;
    })
    .catch(error => {
      console.error('Error saving logs:', error);
      // Fallback: save to localStorage if server save fails
      localStorage.setItem(`usability_logs_${this.sessionId}`, JSON.stringify(this.exportLogs()));
      throw error;
    });
  }
}

// Export the InteractionLogger class
if (typeof module !== 'undefined') {
  module.exports = { InteractionLogger };
}
