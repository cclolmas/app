import React, { useState, useEffect } from 'react';
import AgentStatusIndicator from '../../components/AgentStatusIndicator';
import agentValidationService from '../../services/agentValidationService';
import { logger } from '../../utils/logger';

const AgentDiagnostics = () => {
  const [agentConfig, setAgentConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAgent, setActiveAgent] = useState(null);
  const [agentLogs, setAgentLogs] = useState([]);

  useEffect(() => {
    const fetchAgentConfiguration = async () => {
      try {
        // Aqui você buscaria a configuração real do seu backend
        const config = {
          agents: {
            planner: {
              id: 'planner-agent',
              type: 'planner',
              capabilities: ['task-planning', 'resource-allocation']
            },
            executor: {
              id: 'executor-agent',
              type: 'executor',
              capabilities: ['task-execution', 'error-handling']
            }
          },
          interactions: {
            planner: ['executor'],
            executor: []
          }
        };
        
        setAgentConfig(config);
      } catch (error) {
        logger.error('Erro ao buscar configuração dos agentes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentConfiguration();
  }, []);

  const fetchAgentLogs = async (agentId) => {
    try {
      // Simulando busca de logs de um agente específico
      setAgentLogs([
        { timestamp: new Date().toISOString(), level: 'info', message: `Agente ${agentId} iniciado` },
        { timestamp: new Date(Date.now() - 60000).toISOString(), level: 'info', message: `Comunicação com outros agentes estabelecida` },
        { timestamp: new Date(Date.now() - 120000).toISOString(), level: 'warn', message: `Tentativa de reconexão necessária` }
      ]);
      setActiveAgent(agentId);
    } catch (error) {
      logger.error(`Erro ao buscar logs do agente ${agentId}:`, error);
    }
  };

  const runAgentTest = async () => {
    try {
      const result = await agentValidationService.testAgentCommunication();
      logger.info('Resultado do teste de comunicação:', result);
      // Aqui você poderia exibir uma notificação com o resultado do teste
    } catch (error) {
      logger.error('Erro ao executar teste de comunicação entre agentes:', error);
    }
  };

  if (isLoading) {
    return <div className="loading">Carregando configuração dos agentes...</div>;
  }

  return (
    <div className="agent-diagnostics-page">
      <h1>Diagnóstico de Agentes</h1>

      <div className="status-section">
        <h2>Status da Configuração</h2>
        <AgentStatusIndicator config={agentConfig} />
        
        <div className="action-buttons">
          <button 
            className="primary-button"
            onClick={runAgentTest}
          >
            Testar Comunicação Entre Agentes
          </button>
        </div>
      </div>

      <div className="agents-section">
        <h2>Agentes Configurados</h2>
        {agentConfig && agentConfig.agents ? (
          <div className="agent-list">
            {Object.entries(agentConfig.agents).map(([agentKey, agent]) => (
              <div 
                key={agentKey} 
                className={`agent-item ${activeAgent === agent.id ? 'active' : ''}`}
                onClick={() => fetchAgentLogs(agent.id)}
              >
                <h3>{agent.type}</h3>
                <p>ID: {agent.id}</p>
                <p>Capacidades: {agent.capabilities.join(', ')}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhum agente configurado</p>
        )}
      </div>

      {activeAgent && (
        <div className="agent-logs-section">
          <h2>Logs do Agente: {activeAgent}</h2>
          <div className="logs-container">
            {agentLogs.length > 0 ? (
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Horário</th>
                    <th>Nível</th>
                    <th>Mensagem</th>
                  </tr>
                </thead>
                <tbody>
                  {agentLogs.map((log, index) => (
                    <tr key={`log-${index}`} className={`log-${log.level}`}>
                      <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td>{log.level.toUpperCase()}</td>
                      <td>{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Nenhum log disponível</p>
            )}
          </div>
        </div>
      )}

      <div className="interaction-graph">
        <h2>Gráfico de Interações entre Agentes</h2>
        {/* Aqui poderia ser implementado um componente visual para mostrar
            as interações entre os agentes, usando bibliotecas como D3.js */}
        <div className="graph-placeholder">
          Visualização gráfica das interações entre agentes estaria aqui
        </div>
      </div>
    </div>
  );
};

export default AgentDiagnostics;
