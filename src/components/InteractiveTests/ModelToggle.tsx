import React, { useState } from 'react';
import './styles.css';

interface Model {
  id: string;
  name: string;
  description: string;
}

interface ModelToggleProps {
  models: Model[];
  onModelChange: (model: Model) => void;
}

const ModelToggle: React.FC<ModelToggleProps> = ({ models, onModelChange }) => {
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || '');

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    const selectedModel = models.find(model => model.id === modelId);
    if (selectedModel) {
      onModelChange(selectedModel);
    }
  };

  return (
    <div className="model-toggle-container">
      <h3>Selecione o Modelo</h3>
      <div className="toggle-buttons">
        {models.map((model) => (
          <button
            key={model.id}
            className={`toggle-button ${selectedModelId === model.id ? 'active' : ''}`}
            onClick={() => handleModelChange(model.id)}
          >
            {model.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModelToggle;
