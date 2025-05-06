import React, { useState, useEffect } from 'react';
import CLCompLTradeoffMonitor from '../components/CLCompLTradeoffMonitor';
import TradeoffManager from '../services/TradeoffManager';
import '../styles/CLCompLMonitor.css';

const DebateControl = () => {
  const [tradeoffMetrics, setTradeoffMetrics] = useState({
    confidenceLevel: 50,
    complexityLevel: 50
  });
  
  const [systemState, setSystemState] = useState({
    arguments: {
      supporting: [],
      opposing: []
    },
    evidenceStrength: {
      average: 0.5
    },
    counterArguments: {
      count: 5,
      avgDepth: 2
    }
  });

  // Update metrics whenever system state changes
  useEffect(() => {
    const metrics = TradeoffManager.calculateMetrics(systemState);
    setTradeoffMetrics(metrics);
    
    // Check if adjustments needed
    const suggestions = TradeoffManager.getSuggestions();
    if (suggestions.actions.length > 0) {
      console.log("Trade-off suggestion:", suggestions.message);
    }
  }, [systemState]);

  // Handle parameter adjustments from the monitor
  const handleAdjustParameters = (newParams) => {
    const updatedParams = TradeoffManager.updateParameters(newParams);
    console.log("Parameters updated:", updatedParams);
    
    // Recalculate metrics with new parameters
    const metrics = TradeoffManager.calculateMetrics(systemState);
    setTradeoffMetrics(metrics);
  };

  // Simulate system state changes for testing
  const simulateStateChange = () => {
    setSystemState(prevState => {
      // Simple random changes to system state
      const supportingArgs = prevState.arguments.supporting.length + 
        (Math.random() > 0.5 ? 1 : -1);
      const opposingArgs = prevState.arguments.opposing.length + 
        (Math.random() > 0.5 ? 1 : -1);
      
      return {
        ...prevState,
        arguments: {
          supporting: Array(Math.max(0, supportingArgs)).fill({}),
          opposing: Array(Math.max(0, opposingArgs)).fill({})
        },
        evidenceStrength: {
          average: Math.min(1, Math.max(0, prevState.evidenceStrength.average + 
            (Math.random() * 0.2 - 0.1)))
        },
        counterArguments: {
          count: Math.max(0, prevState.counterArguments.count + 
            (Math.random() > 0.7 ? 1 : -1)),
          avgDepth: Math.max(1, Math.min(5, prevState.counterArguments.avgDepth +
            (Math.random() > 0.7 ? 0.5 : -0.5)))
        }
      };
    });
  };

  return (
    <div className="debate-control-page">
      <h1>Debate Control Panel</h1>
      
      {/* Trade-off Monitor */}
      <section className="tradeoff-section">
        <h2>CL-CompL Trade-off Management</h2>
        <CLCompLTradeoffMonitor
          confidenceLevel={tradeoffMetrics.confidenceLevel}
          complexityLevel={tradeoffMetrics.complexityLevel}
          historicalData={TradeoffManager.getHistoricalData()}
          onAdjustParameters={handleAdjustParameters}
        />
        
        <div className="control-actions">
          <button 
            className="simulate-btn"
            onClick={simulateStateChange}
          >
            Simulate State Change
          </button>
        </div>
      </section>
      
      {/* Trade-off suggestions */}
      <section className="suggestions-section">
        <h3>Optimization Suggestions</h3>
        <div className="suggestion-box">
          <p>{TradeoffManager.getSuggestions().message}</p>
          <ul>
            {TradeoffManager.getSuggestions().actions.map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default DebateControl;