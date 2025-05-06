import React, { useState } from 'react';
import useDescriptionValidator from '../hooks/useDescriptionValidator';
import DescriptionPreview from './DescriptionPreview';
import '../styles/descriptionPreview.css';

const ProblemForm = ({ onSubmit, initialProblem = {} }) => {
  const [problem, setProblem] = useState({
    title: initialProblem.title || '',
  });

  const { 
    description, 
    setDescription, 
    validation, 
    validateNow, 
    getSuggestion 
  } = useDescriptionValidator(initialProblem.description || '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'description') {
      setDescription(value);
    } else {
      setProblem(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateNow()) {
      alert("A descrição do problema pode não ser clara o suficiente. Revise as sugestões antes de continuar.");
      return;
    }
    
    onSubmit({
      ...problem,
      description
    });
  };

  const handleSuggestImprovement = () => {
    const improved = getSuggestion();
    setDescription(improved);
  };

  return (
    <form onSubmit={handleSubmit} className="problem-form">
      <div className="form-group">
        <label htmlFor="title">Título do Problema *</label>
        <input
          id="title"
          name="title"
          value={problem.title}
          onChange={handleChange}
          required
          type="text"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Descrição do Problema *</label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={handleChange}
          required
          rows={6}
          className={!validation.isValid && description ? 'invalid-input' : ''}
        />
        
        {!validation.isValid && description && (
          <div className="validation-feedback">
            <p>{validation.message}</p>
            <button 
              type="button"
              className="suggest-button"
              onClick={handleSuggestImprovement}
            >
              Sugerir melhorias
            </button>
          </div>
        )}
      </div>
      
      <DescriptionPreview description={description} />
      
      <div className="form-actions">
        <button type="submit" className="btn primary">
          Salvar Problema
        </button>
      </div>
    </form>
  );
};

export default ProblemForm;