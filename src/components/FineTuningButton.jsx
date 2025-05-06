import React, { useState } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import { startFineTuningTask } from '../services/fineTuningService';

const FineTuningButton = ({ config, onSuccess, onError, disabled }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStartFineTuning = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Valida a configuração antes de prosseguir
      if (!validateConfig(config)) {
        throw new Error('Configuração inválida. Verifique os parâmetros e tente novamente.');
      }
      
      const response = await startFineTuningTask(config);
      
      setIsLoading(false);
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Erro ao iniciar tarefa de fine-tuning');
      if (onError) {
        onError(err);
      }
    }
  };
  
  // Função para validar a configuração
  const validateConfig = (config) => {
    if (!config) return false;
    
    const requiredFields = ['model', 'trainingData', 'epochs'];
    
    for (const field of requiredFields) {
      if (!config[field]) return false;
    }
    
    return true;
  };

  return (
    <div>
      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      
      <Button 
        variant="primary" 
        onClick={handleStartFineTuning} 
        disabled={isLoading || disabled}
      >
        {isLoading ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{' '}
            Iniciando processo...
          </>
        ) : (
          'Iniciar Fine-tuning'
        )}
      </Button>
    </div>
  );
};

export default FineTuningButton;
