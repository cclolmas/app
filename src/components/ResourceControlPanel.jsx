import React, { useState } from 'react';
import '../styles/resourceVisualization.css';

const ResourceControlPanel = ({ 
  config, 
  onConfigChange, 
  onComparisonToggle, 
  comparisonConfig 
}) => {
  const [isComparing, setIsComparing] = useState(!!comparisonConfig);
  const [localComparisonConfig, setLocalComparisonConfig] = useState(
    comparisonConfig || { ...config }
  );
  
  // Update main configuration
  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    onConfigChange(newConfig);
  };
  
  // Update comparison configuration
  const handleComparisonConfigChange = (key, value) => {
    const newConfig = { ...localComparisonConfig, [key]: value };
    setLocalComparisonConfig(newConfig);
    
    if (isComparing) {
      onComparisonToggle(newConfig);
    }
  };
  
  // Toggle comparison mode
  const toggleComparison = () => {
    const newIsComparing = !isComparing;
    setIsComparing(newIsComparing);
    
    if (newIsComparing) {
      onComparisonToggle(localComparisonConfig);
    } else {
      onComparisonToggle(null);
    }
  };

  return (
    <div className="resource-control-panel">
      <div className="control-panel-header">
        <h3>Configuration Parameters</h3>
        <div className="comparison-toggle">
          <label>
            <input
              type="checkbox"
              checked={isComparing}
              onChange={toggleComparison}
            />
            Enable Comparison Mode
          </label>
        </div>
      </div>
      
      <div className="control-panels-container">
        {/* Main Configuration Panel */}
        <div className="config-panel primary-config">
          <h4>{isComparing ? 'Primary Configuration' : 'Configuration'}</h4>
          
          <div className="control-row">
            <div className="control-group">
              <label htmlFor="model">Model:</label>
              <select
                id="model"
                value={config.model}
                onChange={(e) => handleConfigChange('model', e.target.value)}
              >
                <option value="mistral-7b">Mistral 7B</option>
                <option value="llama-13b">Llama 13B</option>
                <option value="phi-2">Phi-2</option>
                <option value="phi-3-mini">Phi-3 Mini</option>
                <option value="gemma-7b">Gemma 7B</option>
              </select>
            </div>
            
            <div className="control-group">
              <label htmlFor="quantization">Quantization:</label>
              <select
                id="quantization"
                value={config.quantization}
                onChange={(e) => handleConfigChange('quantization', e.target.value)}
              >
                <option value="f16">Float16 (No Quantization)</option>
                <option value="q8">Q8 (8-bit)</option>
                <option value="q6">Q6 (6-bit)</option>
                <option value="q5">Q5 (5-bit)</option>
                <option value="q4">Q4 (4-bit)</option>
                <option value="q3">Q3 (3-bit)</option>
              </select>
            </div>
          </div>
          
          <div className="control-row">
            <div className="control-group">
              <label htmlFor="taskType">Task Type:</label>
              <select
                id="taskType"
                value={config.taskType}
                onChange={(e) => handleConfigChange('taskType', e.target.value)}
              >
                <option value="fine-tuning">Fine-tuning</option>
                <option value="inference">Inference</option>
                <option value="lmas">LMAS Orchestration</option>
              </select>
            </div>
            
            <div className="control-group">
              <label htmlFor="batchSize">Batch Size:</label>
              <select
                id="batchSize"
                value={config.batchSize}
                onChange={(e) => handleConfigChange('batchSize', Number(e.target.value))}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="4">4</option>
                <option value="8">8</option>
                <option value="16">16</option>
                <option value="32">32</option>
              </select>
            </div>
          </div>
          
          <div className="control-row">
            <div className="control-group">
              <label htmlFor="agents">
                {config.taskType === 'lmas' ? 'Number of Agents:' : 'LoRA Rank:'}
              </label>
              <select
                id="agents"
                value={config.agents}
                onChange={(e) => handleConfigChange('agents', Number(e.target.value))}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="8">8</option>
                <option value="16">16</option>
                <option value="32">32</option>
              </select>
            </div>
            
            <div className="control-group">
              <label htmlFor="datasetSize">Dataset Size:</label>
              <select
                id="datasetSize"
                value={config.datasetSize}
                onChange={(e) => handleConfigChange('datasetSize', e.target.value)}
              >
                <option value="tiny">Tiny (100 examples)</option>
                <option value="small">Small (1,000 examples)</option>
                <option value="medium">Medium (10,000 examples)</option>
                <option value="large">Large (100,000 examples)</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Comparison Configuration Panel (visible when comparison is enabled) */}
        {isComparing && (
          <div className="config-panel comparison-config">
            <h4>Comparison Configuration</h4>
            
            <div className="control-row">
              <div className="control-group">
                <label htmlFor="comp-model">Model:</label>
                <select
                  id="comp-model"
                  value={localComparisonConfig.model}
                  onChange={(e) => handleComparisonConfigChange('model', e.target.value)}
                >
                  <option value="mistral-7b">Mistral 7B</option>
                  <option value="llama-13b">Llama 13B</option>
                  <option value="phi-2">Phi-2</option>
                  <option value="phi-3-mini">Phi-3 Mini</option>
                  <option value="gemma-7b">Gemma 7B</option>
                </select>
              </div>
              
              <div className="control-group">
                <label htmlFor="comp-quantization">Quantization:</label>
                <select
                  id="comp-quantization"
                  value={localComparisonConfig.quantization}
                  onChange={(e) => handleComparisonConfigChange('quantization', e.target.value)}
                >
                  <option value="f16">Float16 (No Quantization)</option>
                  <option value="q8">Q8 (8-bit)</option>
                  <option value="q6">Q6 (6-bit)</option>
                  <option value="q5">Q5 (5-bit)</option>
                  <option value="q4">Q4 (4-bit)</option>
                  <option value="q3">Q3 (3-bit)</option>
                </select>
              </div>
            </div>
            
            <div className="control-row">
              <div className="control-group">
                <label htmlFor="comp-taskType">Task Type:</label>
                <select
                  id="comp-taskType"
                  value={localComparisonConfig.taskType}
                  onChange={(e) => handleComparisonConfigChange('taskType', e.target.value)}
                >
                  <option value="fine-tuning">Fine-tuning</option>
                  <option value="inference">Inference</option>
                  <option value="lmas">LMAS Orchestration</option>
                </select>
              </div>
              
              <div className="control-group">
                <label htmlFor="comp-batchSize">Batch Size:</label>
                <select
                  id="comp-batchSize"
                  value={localComparisonConfig.batchSize}
                  onChange={(e) => handleComparisonConfigChange('batchSize', Number(e.target.value))}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="4">4</option>
                  <option value="8">8</option>
                  <option value="16">16</option>
                  <option value="32">32</option>
                </select>
              </div>
            </div>
            
            <div className="control-row">
              <div className="control-group">
                <label htmlFor="comp-agents">
                  {localComparisonConfig.taskType === 'lmas' ? 'Number of Agents:' : 'LoRA Rank:'}
                </label>
                <select
                  id="comp-agents"
                  value={localComparisonConfig.agents}
                  onChange={(e) => handleComparisonConfigChange('agents', Number(e.target.value))}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="8">8</option>
                  <option value="16">16</option>
                  <option value="32">32</option>
                </select>
              </div>
              
              <div className="control-group">
                <label htmlFor="comp-datasetSize">Dataset Size:</label>
                <select
                  id="comp-datasetSize"
                  value={localComparisonConfig.datasetSize}
                  onChange={(e) => handleComparisonConfigChange('datasetSize', e.target.value)}
                >
                  <option value="tiny">Tiny (100 examples)</option>
                  <option value="small">Small (1,000 examples)</option>
                  <option value="medium">Medium (10,000 examples)</option>
                  <option value="large">Large (100,000 examples)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="preset-configurations">
        <h4>Preset Configurations</h4>
        <div className="preset-buttons">
          <button onClick={() => onConfigChange({
            model: 'phi-2',
            quantization: 'q4',
            batchSize: 1,
            taskType: 'inference',
            agents: 1,
            datasetSize: 'small'
          })}>
            Low Resource Setup
          </button>
          
          <button onClick={() => onConfigChange({
            model: 'mistral-7b',
            quantization: 'q8',
            batchSize: 4,
            taskType: 'fine-tuning',
            agents: 8,
            datasetSize: 'medium'
          })}>
            Balanced Setup
          </button>
          
          <button onClick={() => onConfigChange({
            model: 'llama-13b',
            quantization: 'f16',
            batchSize: 8,
            taskType: 'lmas',
            agents: 3,
            datasetSize: 'large'
          })}>
            High Resource Setup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceControlPanel;
