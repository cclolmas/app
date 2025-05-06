import React, { useState } from 'react';
import InteractiveTooltip from './InteractiveTooltip';
import ModelToggle from './ModelToggle';
import DataFilter from './DataFilter';
import './styles.css';

const InteractiveTestPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [selectedQuantizations, setSelectedQuantizations] = useState<string[]>([]);
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [results, setResults] = useState<string>('');

  // Dados de exemplo
  const models = [
    { id: 'model1', name: 'GPT-4', description: 'Modelo avançado da OpenAI' },
    { id: 'model2', name: 'BERT', description: 'Modelo de linguagem bidirecional da Google' },
    { id: 'model3', name: 'LLaMA', description: 'Modelo grande de linguagem da Meta' }
  ];

  const quantizationOptions = [
    { id: 'q1', label: '4-bit' },
    { id: 'q2', label: '8-bit' },
    { id: 'q3', label: '16-bit' }
  ];

  const datasetOptions = [
    { id: 'd1', label: 'SQUAD' },
    { id: 'd2', label: 'GLUE' },
    { id: 'd3', label: 'MMLU' }
  ];

  const handleModelChange = (model: any) => {
    setSelectedModel(model);
    setResults(`Modelo selecionado: ${model.name}`);
  };

  const handleQuantizationChange = (options: string[]) => {
    setSelectedQuantizations(options);
    const labels = options.map(
      id => quantizationOptions.find(opt => opt.id === id)?.label
    ).filter(Boolean);
    
    setResults(prev => 
      `${prev}\nQuantizações selecionadas: ${labels.join(', ') || 'Nenhuma'}`
    );
  };

  const handleDatasetChange = (options: string[]) => {
    setSelectedDatasets(options);
    const labels = options.map(
      id => datasetOptions.find(opt => opt.id === id)?.label
    ).filter(Boolean);
    
    setResults(prev => 
      `${prev}\nDatasets selecionados: ${labels.join(', ') || 'Nenhum'}`
    );
  };

  return (
    <div className="interactive-test-container">
      <h1>Teste de Componentes Interativos</h1>
      
      <section>
        <h2>1. Tooltips</h2>
        <div className="tooltip-examples">
          <InteractiveTooltip text="Esta é uma dica que aparece acima do elemento">
            <button className="demo-button">Hover para ver tooltip (cima)</button>
          </InteractiveTooltip>
          
          <InteractiveTooltip text="Esta dica aparece abaixo" position="bottom">
            <button className="demo-button">Hover para ver tooltip (baixo)</button>
          </InteractiveTooltip>
          
          <InteractiveTooltip text="Esta dica aparece à esquerda" position="left">
            <button className="demo-button">Hover para ver tooltip (esquerda)</button>
          </InteractiveTooltip>
          
          <InteractiveTooltip text="Esta dica aparece à direita" position="right">
            <button className="demo-button">Hover para ver tooltip (direita)</button>
          </InteractiveTooltip>
        </div>
      </section>
      
      <section>
        <h2>2. Alternância entre Modelos</h2>
        <ModelToggle models={models} onModelChange={handleModelChange} />
      </section>
      
      <section>
        <h2>3. Filtros de Dados</h2>
        <div className="filters-container">
          <DataFilter 
            title="Quantização" 
            options={quantizationOptions} 
            onFilterChange={handleQuantizationChange}
            multiSelect={true}
          />
          
          <DataFilter 
            title="Dataset" 
            options={datasetOptions} 
            onFilterChange={handleDatasetChange}
            multiSelect={false}
          />
        </div>
      </section>
      
      <section className="results-section">
        <h2>Resultados das Interações</h2>
        <div className="results-display">
          <pre>{results}</pre>
        </div>
      </section>
    </div>
  );
};

export default InteractiveTestPage;
