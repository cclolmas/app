import React, { useState } from 'react';
import './TutorialModal.css';

const TutorialModal = ({ tutorial, isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  if (!isOpen || !tutorial) return null;

  const totalSteps = tutorial.steps ? tutorial.steps.length : 0;
  
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleTryExample = () => {
    // Implementação para carregar o exemplo no editor da aplicação
    if (tutorial.example) {
      // Você pode emitir um evento ou chamar uma função de callback aqui
      console.log('Carregar exemplo:', tutorial.example);
      onClose();
    }
  };

  return (
    <div className={`tutorial-modal-overlay ${isOpen ? 'visible' : ''}`}>
      <div className="tutorial-modal">
        <div className="modal-header">
          <h2>{tutorial.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {tutorial.steps && tutorial.steps.length > 0 ? (
            <div className="tutorial-steps">
              <div className="step-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(currentStep + 1) / totalSteps * 100}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  Passo {currentStep + 1} de {totalSteps}
                </span>
              </div>
              
              <div className="step-content">
                <h3>{tutorial.steps[currentStep].title}</h3>
                <div className="step-description">
                  {tutorial.steps[currentStep].description}
                </div>
                
                {tutorial.steps[currentStep].image && (
                  <div className="step-image">
                    <img 
                      src={tutorial.steps[currentStep].image} 
                      alt={tutorial.steps[currentStep].title}
                    />
                  </div>
                )}
                
                {tutorial.steps[currentStep].code && (
                  <div className="step-code">
                    <pre>
                      <code>{tutorial.steps[currentStep].code}</code>
                    </pre>
                  </div>
                )}
              </div>
              
              <div className="step-navigation">
                <button 
                  className="nav-btn prev-btn" 
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                >
                  Anterior
                </button>
                <button 
                  className="nav-btn next-btn" 
                  onClick={handleNext}
                  disabled={currentStep === totalSteps - 1}
                >
                  Próximo
                </button>
              </div>
            </div>
          ) : (
            <div className="tutorial-description">
              <p>{tutorial.description}</p>
            </div>
          )}
          
          {tutorial.example && (
            <div className="tutorial-example">
              <h3>Exemplo pronto para uso</h3>
              <p>Você pode carregar este exemplo diretamente no editor:</p>
              <div className="example-preview">
                <pre>
                  <code>{tutorial.example.preview || "Visualização do código não disponível"}</code>
                </pre>
              </div>
              <button className="try-example-btn" onClick={handleTryExample}>
                Carregar no Editor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
