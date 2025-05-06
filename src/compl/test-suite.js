/**
 * CompL Test Suite
 * Evaluates model switching and visualization updates
 */

import ComplModelSwitcher from './model-switcher';

class ComplTestSuite {
  constructor() {
    this.modelSwitcher = new ComplModelSwitcher({
      logPerformance: true,
      visualFeedback: true
    });
    this.testResults = [];
    this.availableModels = [];
  }

  /**
   * Register a test model
   */
  registerModel(model) {
    this.availableModels.push(model);
    return this;
  }

  /**
   * Run a single test switching between two models
   */
  async runSingleTest(fromModelIdx, toModelIdx, iterations = 1) {
    const fromModel = this.availableModels[fromModelIdx];
    const toModel = this.availableModels[toModelIdx];
    
    if (!fromModel || !toModel) {
      throw new Error('Invalid model indices');
    }
    
    const result = {
      fromModel: fromModel.name,
      toModel: toModel.name,
      iterations,
      updateTimes: [],
      averageUpdateTime: 0,
      medianUpdateTime: 0,
      minUpdateTime: Infinity,
      maxUpdateTime: 0
    };
    
    // First switch to the "from" model as starting point
    await this.modelSwitcher.switchModel(fromModel);
    
    // Now run the test iterations
    for (let i = 0; i < iterations; i++) {
      // Switch to "to" model and measure
      const switchResult = await this.modelSwitcher.switchModel(toModel);
      result.updateTimes.push(switchResult.updateTime);
      
      // Switch back to "from" model to prepare for next iteration
      await this.modelSwitcher.switchModel(fromModel);
    }
    
    // Calculate statistics
    result.updateTimes.sort((a, b) => a - b);
    result.minUpdateTime = result.updateTimes[0];
    result.maxUpdateTime = result.updateTimes[result.updateTimes.length - 1];
    
    const sum = result.updateTimes.reduce((acc, time) => acc + time, 0);
    result.averageUpdateTime = sum / result.updateTimes.length;
    
    const mid = Math.floor(result.updateTimes.length / 2);
    result.medianUpdateTime = 
      result.updateTimes.length % 2 === 0
        ? (result.updateTimes[mid - 1] + result.updateTimes[mid]) / 2
        : result.updateTimes[mid];
    
    this.testResults.push(result);
    return result;
  }
  
  /**
   * Run a complete test suite with all model combinations
   */
  async runFullTestSuite(iterations = 3) {
    const results = [];
    
    for (let i = 0; i < this.availableModels.length; i++) {
      for (let j = 0; j < this.availableModels.length; j++) {
        if (i === j) continue; // Skip testing same model
        
        const result = await this.runSingleTest(i, j, iterations);
        results.push(result);
      }
    }
    
    return results;
  }
  
  /**
   * Generate a report from test results
   */
  generateReport() {
    if (this.testResults.length === 0) {
      return { summary: "No tests have been run" };
    }
    
    const allTimes = this.testResults.flatMap(r => r.updateTimes);
    const overallAvg = allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length;
    
    // Sort models by average performance
    const modelPerformance = {};
    
    this.testResults.forEach(result => {
      if (!modelPerformance[result.toModel]) {
        modelPerformance[result.toModel] = {
          totalTime: 0,
          count: 0,
          avgTime: 0
        };
      }
      
      modelPerformance[result.toModel].totalTime += result.averageUpdateTime;
      modelPerformance[result.toModel].count += 1;
    });
    
    // Calculate averages for each model
    Object.keys(modelPerformance).forEach(model => {
      const perfInfo = modelPerformance[model];
      perfInfo.avgTime = perfInfo.totalTime / perfInfo.count;
    });
    
    // Sort models by performance
    const sortedModels = Object.entries(modelPerformance)
      .sort((a, b) => a[1].avgTime - b[1].avgTime)
      .map(([name, stats]) => ({
        name,
        avgUpdateTime: stats.avgTime
      }));
    
    return {
      testsRun: this.testResults.length,
      totalIterations: allTimes.length,
      overallAverageUpdateTime: overallAvg,
      fastestModel: sortedModels[0],
      slowestModel: sortedModels[sortedModels.length - 1],
      modelRanking: sortedModels,
      detailedResults: this.testResults
    };
  }
}

export default ComplTestSuite;
