import React, { useState } from 'react';
import './AgentCreationForm.css';

const availableTools = [
  { id: 'web-search', name: 'Web Search', description: 'Search the internet for information' },
  { id: 'calculator', name: 'Calculator', description: 'Perform numerical calculations' },
  { id: 'database', name: 'Database Access', description: 'Query internal databases' },
  { id: 'api-call', name: 'API Call', description: 'Make external API calls' },
];

export default function AgentCreationForm() {
  const [agentName, setAgentName] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [selectedTools, setSelectedTools] = useState([]);
  const [communicationFlow, setCommunicationFlow] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!agentName.trim()) {
      newErrors.agentName = 'Agent name is required';
    }
    
    if (prompts.length === 0) {
      newErrors.prompts = 'At least one prompt is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPrompt = () => {
    if (currentPrompt.trim()) {
      setPrompts([...prompts, currentPrompt.trim()]);
      setCurrentPrompt('');
    }
  };

  const handleRemovePrompt = (index) => {
    const newPrompts = [...prompts];
    newPrompts.splice(index, 1);
    setPrompts(newPrompts);
  };

  const handleAddTool = (toolId) => {
    const tool = availableTools.find(t => t.id === toolId);
    if (tool && !selectedTools.some(t => t.id === toolId)) {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handleRemoveTool = (toolId) => {
    setSelectedTools(selectedTools.filter(tool => tool.id !== toolId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create agent payload
      const agentData = {
        name: agentName,
        prompts,
        tools: selectedTools,
        communicationFlow,
      };
      
      console.log('Agent created:', agentData);
      setSuccess(true);
      // Reset form or redirect
    } catch (error) {
      console.error('Error creating agent:', error);
      setErrors({ submit: 'Failed to create agent. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="agent-creation-form-container">
      <h1>Create New Agent</h1>
      
      {success ? (
        <div className="success-message">
          <p>Agent created successfully!</p>
          <button onClick={() => window.location.href = '/agents'}>Go to Agents List</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Agent Name */}
          <div className="form-group">
            <label htmlFor="agentName">Agent Name:</label>
            <input
              type="text"
              id="agentName"
              name="agentName"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Enter agent name"
            />
            {errors.agentName && <div className="error-message">{errors.agentName}</div>}
          </div>
          
          {/* Prompts Section */}
          <div className="form-group">
            <h2>Prompts</h2>
            <div className="prompt-input">
              <textarea
                name="prompt"
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                placeholder="Enter prompt text"
                rows={3}
              />
              <button type="button" onClick={handleAddPrompt}>Add Prompt</button>
            </div>
            
            {errors.prompts && <div className="error-message">{errors.prompts}</div>}
            
            <div className="prompt-list">
              {prompts.map((prompt, index) => (
                <div key={index} className="prompt-list-item">
                  <p>{prompt}</p>
                  <button type="button" onClick={() => handleRemovePrompt(index)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Tools Section */}
          <div className="form-group">
            <h2>Tools</h2>
            <div className="tool-selector">
              <select name="toolSelect" defaultValue="">
                <option value="" disabled>Select a tool</option>
                {availableTools.map(tool => (
                  <option key={tool.id} value={tool.id}>{tool.name}</option>
                ))}
              </select>
              <button 
                type="button" 
                onClick={() => {
                  const select = document.querySelector('select[name="toolSelect"]');
                  if (select.value) handleAddTool(select.value);
                }}
              >
                Add Tool
              </button>
            </div>
            
            <div className="tool-list">
              {selectedTools.map(tool => (
                <div key={tool.id} className="tool-list-item">
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>
                  <button type="button" onClick={() => handleRemoveTool(tool.id)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Communication Flow */}
          <div className="form-group">
            <h2>Communication Flow</h2>
            <textarea
              name="communicationFlow"
              value={communicationFlow}
              onChange={(e) => setCommunicationFlow(e.target.value)}
              placeholder="Define communication flow (e.g., user->agent->user)"
              rows={3}
            />
            
            {communicationFlow && (
              <div className="flow-preview">
                <h3>Flow Preview:</h3>
                <div className="flow-diagram">
                  {communicationFlow.split('->').map((node, idx, arr) => (
                    <React.Fragment key={idx}>
                      <span className="flow-node">{node}</span>
                      {idx < arr.length - 1 && <span className="flow-arrow">→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {errors.submit && <div className="error-message global">{errors.submit}</div>}
          
          <div className="form-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
