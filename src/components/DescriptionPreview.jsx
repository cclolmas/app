import React from 'react';
import { validateDescription } from '../utils/descriptionValidator';

/**
 * A component that renders a preview of a problem description with clarity feedback
 */
const DescriptionPreview = ({ description }) => {
  const validation = validateDescription(description);
  
  return (
    <div className="description-preview">
      <h4>Pré-visualização da descrição</h4>
      <div className="preview-content">
        {description ? (
          <p>{description}</p>
        ) : (
          <p className="placeholder-text">A pré-visualização da descrição aparecerá aqui...</p>
        )}
      </div>
      
      <div className={`clarity-feedback ${validation.isValid ? 'valid' : 'invalid'}`}>
        <h5>Feedback de clareza:</h5>
        <p>{validation.message}</p>
        
        {validation.suggestions.length > 0 && (
          <div className="suggestions">
            <h5>Sugestões para melhorar:</h5>
            <ul>
              {validation.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DescriptionPreview;
