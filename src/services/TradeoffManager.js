/**
 * Service to handle CL-CompL trade-off calculations and management
 */
class TradeoffManager {
  constructor() {
    this.parameters = {
      precisionFactor: 5,
      complexityThreshold: 50,
      balanceFactor: 1.0,
      adaptiveMode: true
    };
    
    this.metrics = {
      confidenceLevel: 0,
      complexityLevel: 0,
      tradeoffScore: 0
    };
    
    this.history = [];
  }

  /**
   * Calculate the current CL-CompL metrics based on system state
   * @param {Object} systemState - Current state of the debate system
   */
  calculateMetrics(systemState) {
    // Example implementation - replace with actual metrics calculation
    const { arguments, evidenceStrength, counterArguments } = systemState;
    
    // Calculate confidence level based on number of supported arguments and evidence strength
    const rawConfidence = (arguments.supporting.length / 
      (arguments.supporting.length + arguments.opposing.length || 1)) * 
      (evidenceStrength.average || 0) * 10;
    
    // Calculate complexity level based on number of counter-arguments and their depth
    const rawComplexity = (counterArguments.count || 0) * 
      (counterArguments.avgDepth || 1) * 
      (this.parameters.precisionFactor / 5);
    
    // Normalize values to percentage
    this.metrics.confidenceLevel = Math.min(100, Math.max(0, rawConfidence * 10));
    this.metrics.complexityLevel = Math.min(100, Math.max(0, rawComplexity * 5));
    
    // Calculate trade-off score
    this.metrics.tradeoffScore = this.calculateTradeoffScore();
    
    // Record historical data
    this.recordDataPoint();
    
    return this.metrics;
  }
  
  /**
   * Calculates a single score representing the balance of the trade-off
   */
  calculateTradeoffScore() {
    const { confidenceLevel, complexityLevel } = this.metrics;
    const { balanceFactor, complexityThreshold } = this.parameters;
    
    // Higher score means better balance according to current parameters
    return (confidenceLevel * balanceFactor) - 
      (Math.max(0, complexityLevel - complexityThreshold) * (1 / balanceFactor));
  }
  
  /**
   * Record current metrics for historical tracking
   */
  recordDataPoint() {
    this.history.push({
      timestamp: new Date().toISOString(),
      cl: this.metrics.confidenceLevel,
      compL: this.metrics.complexityLevel,
      score: this.metrics.tradeoffScore
    });
    
    // Keep history at a reasonable size
    if (this.history.length > 100) {
      this.history.shift();
    }
  }
  
  /**
   * Update the parameters that control the trade-off
   */
  updateParameters(newParams) {
    this.parameters = {
      ...this.parameters,
      ...newParams
    };
    
    return this.parameters;
  }
  
  /**
   * Get optimization suggestions based on current metrics
   */
  getSuggestions() {
    const { confidenceLevel, complexityLevel } = this.metrics;
    
    if (confidenceLevel < 30 && complexityLevel > 70) {
      return {
        message: "System appears too complex with low confidence. Consider simplifying arguments.",
        actions: ["Reduce precision factor", "Increase complexity threshold"]
      };
    } else if (confidenceLevel > 80 && complexityLevel < 20) {
      return {
        message: "System may be oversimplified. Consider adding more nuance.",
        actions: ["Increase precision factor", "Decrease complexity threshold"]
      };
    }
    
    return {
      message: "Trade-off appears balanced.",
      actions: []
    };
  }
  
  /**
   * Get all historical data points
   */
  getHistoricalData() {
    return this.history;
  }
}

export default new TradeoffManager();
