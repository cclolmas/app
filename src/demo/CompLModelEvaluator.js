/**
 * CompL Model Evaluator Demo
 * Demonstrates the model switching and visualization update tracking
 */

import React, { useState, useEffect } from 'react';
import ComplModelSwitcher from '../compl/model-switcher';
import ComplVisualizationMonitor from '../components/ComplVisualizationMonitor';
import ComplTestSuite from '../compl/test-suite';
import { createTrackedVisualization } from '../compl/visualization-wrapper';
import '../styles/compl-monitor.css';

// Sample models for demonstration
const SAMPLE_MODELS = [
  { name: 'BERT-base', loadTime: 200, inferenceTime: 50 },
  { name: 'DistilBERT', loadTime: 100, inferenceTime: 30 },
  { name: 'RoBERTa-large', loadTime: 500, inferenceTime: 100 },
  { name: 'T5-small', loadTime: 300, inferenceTime: 60 },
];

// Sample visualization component
class SampleVisualization extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      processingTime: 0
    };
  }
  
  // This method is called by the model switcher
  async onModelChanged(prevModel, newModel) {
    const startTime = performance.now();
    
    // Simulate processing time based on model
    const processingDelay = (newModel?.inferenceTime || 100) + Math.random() * 50;
    
    // Generate sample data
    await new Promise(resolve => setTimeout(resolve, processingDelay));
    
    // Update visualization data
    this.setState({
      data: Array(10).fill(0).map(() => Math.random() * 100),
      processingTime: performance.now() - startTime
    });
  }
  
  render() {
    const { data, processingTime } = this.state;
    
    return (
      <div className="sample-visualization">
        <h3>Visualization: {this.props.title || 'Unnamed'}</h3>
        <div className="processing-info">
          Processing time: {processingTime.toFixed(2)}ms
        </div>
        <div className="visualization-chart">
          {data.map((value, index) => (
            <div 
              key={index} 
              className="bar" 
              style={{ height: `${value}px` }}
              title={`Value: ${value.toFixed(2)}`}
            />
          ))}
        </div>
      </div>
    );
  }
}

// Create tracked versions of the visualization
const TrackedVisualization = createTrackedVisualization(SampleVisualization);

// Main demo component
const CompLModelEvaluator = () => {
  const [modelSwitcher] = useState(() => new ComplModelSwitcher());
  const [testSuite] = useState(() => new ComplTestSuite());
  const [currentModel, setCurrentModel] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  
  // Initialize models
  useEffect(() => {
    SAMPLE_MODELS.forEach(model => testSuite.registerModel(model));
  }, [testSuite]);
  
  const handleModelChange = async (model) => {
    await modelSwitcher.switchModel(model);
    setCurrentModel(model);
  };
  
  const runTestSuite = async () => {
    setIsRunningTests(true);
    await testSuite.runFullTestSuite(3);
    const results = testSuite.generateReport();
    setTestResults(results);
    setIsRunningTests(false);
  };
  
  return (
    <div className="compl-evaluator-container">
      <h2>CompL Model Update Evaluator</h2>
      
      <div className="model-selector">
        <h3>Select Model</h3>
        <div className="model-buttons">
          {SAMPLE_MODELS.map(model => (
            <button
              key={model.name}
              onClick={() => handleModelChange(model)}
              className={currentModel?.name === model.name ? 'active' : ''}
            >
              {model.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="visualizations-container">
        <TrackedVisualization 
          modelSwitcher={modelSwitcher} 
          title="Text Analysis" 
        />
        
        <TrackedVisualization 
          modelSwitcher={modelSwitcher} 
          title="Sentiment Scores" 
        />
        
        <TrackedVisualization 
          modelSwitcher={modelSwitcher} 
          title="Entity Recognition" 
        />
      </div>
      
      <div className="test-suite-container">
        <h3>Automated Testing</h3>
        <button 
          className="run-tests-button"
          onClick={runTestSuite}
          disabled={isRunningTests}
        >
          {isRunningTests ? 'Running Tests...' : 'Run Test Suite'}
        </button>
        
        {testResults && (
          <div className="test-results">
            <h4>Test Results</h4>
            <div className="result-summary">
              <p>Tests run: {testResults.testsRun}</p>
              <p>Overall average update time: {testResults.overallAverageUpdateTime.toFixed(2)}ms</p>
              <p>Fastest model: {testResults.fastestModel.name} ({testResults.fastestModel.avgUpdateTime.toFixed(2)}ms)</p>
              <p>Slowest model: {testResults.slowestModel.name} ({testResults.slowestModel.avgUpdateTime.toFixed(2)}ms)</p>
            </div>
            
            <h4>Model Ranking</h4>
            <ol className="model-ranking">
              {testResults.modelRanking.map((model, idx) => (
                <li key={idx}>
                  {model.name} - {model.avgUpdateTime.toFixed(2)}ms
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
      
      {/* Monitor component */}
      <ComplVisualizationMonitor modelSwitcher={modelSwitcher} />
    </div>
  );
};

export default CompLModelEvaluator;
