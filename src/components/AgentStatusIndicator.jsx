import React, { useEffect, useState } from 'react';
import agentValidationService from '../services/agentValidationService';

const statusColors = {
  success: 'green',
  error: 'red',
  warning: 'orange',
  unknown: 'gray',
};

const AgentStatusIndicator = ({ config = {} }) => {
  const [validationStatus, setValidationStatus] = useState({
    status: 'unknown',
    errors: [],
    warnings: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateAgents = async () => {
      setIsLoading(true);
      try {
        const configResult = await agentValidationService.validateAgentConfiguration(config);
        const commResult = await agentValidationService.testAgentCommunication();
        
        // Combinando os resultados
        const combinedStatus = configResult.status === 'error' || commResult.status === 'error' 
          ? 'error' 
          : 'success';
          
        setValidationStatus({
          status: combinedStatus,
          errors: [...configResult.errors, ...commResult.errors],
          warnings: [...configResult.warnings, ...commResult.warnings],
        });
      } catch (error) {
        console.error('Falha ao validar agentes:', error);
        setValidationStatus({
          status: 'error',
          errors: [`Falha ao validar: ${error.message}`],
          warnings: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (config && Object.keys(config).length > 0) {
      validateAgents();
    }
  }, [config]);

  if (isLoading) {
    return <div className="agent-status-loading">Verificando status dos agentes...</div>;
  }

  return (
    <div className="agent-status-indicator">
      <div className="status-header">
        <span 
          className="status-dot" 
          style={{ backgroundColor: statusColors[validationStatus.status] }}
        />
        <h3>Status dos Agentes: {validationStatus.status === 'success' ? 'Operacional' : 'Problemas Detectados'}</h3>
      </div>

      {validationStatus.errors.length > 0 && (
        <div className="status-errors">
          <h4>Erros:</h4>
          <ul>
            {validationStatus.errors.map((error, index) => (
              <li key={`error-${index}`}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {validationStatus.warnings.length > 0 && (
        <div className="status-warnings">
          <h4>Avisos:</h4>
          <ul>
            {validationStatus.warnings.map((warning, index) => (
              <li key={`warning-${index}`}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AgentStatusIndicator;
