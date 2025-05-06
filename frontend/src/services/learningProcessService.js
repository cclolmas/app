import { api } from './api';
import { v4 as uuidv4 } from 'uuid';

/**
 * Serviço para registrar e analisar o processo de aprendizagem dos alunos
 */
class LearningProcessService {
  /**
   * Inicia uma nova sessão de aprendizagem para um determinado tipo de tarefa
   * 
   * @param {string} taskType - Tipo de tarefa ('fine-tuning', 'lmas')
   * @returns {string} ID da sessão de aprendizagem
   */
  async createLearningSession(taskType) {
    try {
      const sessionId = uuidv4();
      
      // Em produção, chamaria uma API para registro no backend
      const response = await api.post('/learning-process/sessions', {
        sessionId,
        taskType,
        startedAt: new Date().toISOString(),
        userId: this._getCurrentUserId()
      });
      
      return sessionId;
    } catch (error) {
      console.error('Erro ao criar sessão de aprendizagem:', error);
      
      // Fallback para armazenamento local em caso de falha da API
      const sessionId = uuidv4();
      this._storeLocalSession(sessionId, taskType);
      return sessionId;
    }
  }
  
  /**
   * Registra uma mudança de configuração durante o processo de aprendizagem
   * 
   * @param {string} sessionId - ID da sessão de aprendizagem
   * @param {Object} configChange - Dados da mudança de configuração
   */
  async recordConfigChange(sessionId, configChange) {
    try {
      await api.post(`/learning-process/sessions/${sessionId}/config-changes`, {
        ...configChange,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao registrar mudança de configuração:', error);
      this._storeLocalEvent(sessionId, 'config_changes', configChange);
    }
  }
  
  /**
   * Registra uma justificativa de decisão do aluno
   * 
   * @param {string} sessionId - ID da sessão de aprendizagem
   * @param {Object} justification - Dados da justificativa
   */
  async recordDecisionJustification(sessionId, justification) {
    try {
      await api.post(`/learning-process/sessions/${sessionId}/justifications`, justification);
    } catch (error) {
      console.error('Erro ao registrar justificativa de decisão:', error);
      this._storeLocalEvent(sessionId, 'justifications', justification);
    }
  }
  
  /**
   * Registra um marco importante durante o processo de aprendizagem
   * 
   * @param {string} sessionId - ID da sessão de aprendizagem
   * @param {Object} milestone - Dados do marco
   */
  async recordMilestone(sessionId, milestone) {
    try {
      await api.post(`/learning-process/sessions/${sessionId}/milestones`, milestone);
    } catch (error) {
      console.error('Erro ao registrar marco do processo:', error);
      this._storeLocalEvent(sessionId, 'milestones', milestone);
    }
  }
  
  /**
   * Registra um log importante para análise do processo de aprendizagem
   * 
   * @param {string} sessionId - ID da sessão de aprendizagem
   * @param {Object} log - Dados do log
   */
  async recordLog(sessionId, log) {
    try {
      await api.post(`/learning-process/sessions/${sessionId}/logs`, {
        ...log,
        timestamp: log.timestamp || new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao registrar log:', error);
      this._storeLocalEvent(sessionId, 'logs', log);
    }
  }
  
  /**
   * Registra um erro ocorrido durante o processo de aprendizagem
   * 
   * @param {string} sessionId - ID da sessão de aprendizagem
   * @param {Object} errorData - Dados do erro
   */
  async recordError(sessionId, errorData) {
    try {
      await api.post(`/learning-process/sessions/${sessionId}/errors`, errorData);
    } catch (error) {
      console.error('Erro ao registrar erro do processo:', error);
      this._storeLocalEvent(sessionId, 'errors', errorData);
    }
  }
  
  /**
   * Finaliza uma sessão de aprendizagem
   * 
   * @param {string} sessionId - ID da sessão de aprendizagem
   * @param {Object} summary - Resumo da sessão
   */
  async finishLearningSession(sessionId, summary = {}) {
    try {
      await api.patch(`/learning-process/sessions/${sessionId}`, {
        finishedAt: new Date().toISOString(),
        summary
      });
    } catch (error) {
      console.error('Erro ao finalizar sessão de aprendizagem:', error);
      this._updateLocalSession(sessionId, {
        finishedAt: new Date().toISOString(),
        summary
      });
    }
  }
  
  /**
   * Obtém todas as sessões de aprendizagem de um aluno
   * 
   * @param {Object} filters - Filtros para pesquisa
   * @returns {Array} Sessões de aprendizagem
   */
  async getLearningSessions(filters = {}) {
    try {
      const response = await api.get('/learning-process/sessions', {
        params: {
          ...filters,
          userId: this._getCurrentUserId()
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro ao obter sessões de aprendizagem:', error);
      return this._getLocalSessions();
    }
  }
  
  /**
   * Obtém detalhes de uma sessão de aprendizagem específica
   * 
   * @param {string} sessionId - ID da sessão de aprendizagem
   * @returns {Object} Detalhes da sessão
   */
  async getLearningSessionDetails(sessionId) {
    try {
      const response = await api.get(`/learning-process/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter detalhes da sessão:', error);
      return this._getLocalSession(sessionId);
    }
  }
  
  /**
   * Obtém análises do processo de aprendizagem de um aluno
   * 
   * @param {string} userId - ID do aluno (opcional, usa usuário atual se não fornecido)
   * @returns {Object} Análises do processo de aprendizagem
   */
  async getLearningAnalytics(userId = null) {
    try {
      const response = await api.get('/learning-process/analytics', {
        params: {
          userId: userId || this._getCurrentUserId()
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro ao obter análises de aprendizagem:', error);
      return {};
    }
  }
  
  // Métodos auxiliares privados
  
  /**
   * Obtém ID do usuário atual
   * @private
   */
  _getCurrentUserId() {
    // Em uma implementação real, obteria do contexto de autenticação
    return localStorage.getItem('userId') || 'anonymous';
  }
  
  /**
   * Armazena sessão localmente (fallback)
   * @private
   */
  _storeLocalSession(sessionId, taskType) {
    const sessions = this._getLocalSessions();
    sessions[sessionId] = {
      id: sessionId,
      taskType,
      startedAt: new Date().toISOString(),
      userId: this._getCurrentUserId(),
      events: {
        config_changes: [],
        justifications: [],
        milestones: [],
        logs: [],
        errors: []
      }
    };
    localStorage.setItem('learningSessions', JSON.stringify(sessions));
  }
  
  /**
   * Atualiza sessão armazenada localmente
   * @private
   */
  _updateLocalSession(sessionId, data) {
    const sessions = this._getLocalSessions();
    if (sessions[sessionId]) {
      sessions[sessionId] = {
        ...sessions[sessionId],
        ...data
      };
      localStorage.setItem('learningSessions', JSON.stringify(sessions));
    }
  }
  
  /**
   * Armazena um evento localmente (fallback)
   * @private
   */
  _storeLocalEvent(sessionId, eventType, eventData) {
    const sessions = this._getLocalSessions();
    if (sessions[sessionId]) {
      if (!sessions[sessionId].events) {
        sessions[sessionId].events = {};
      }
      if (!sessions[sessionId].events[eventType]) {
        sessions[sessionId].events[eventType] = [];
      }
      sessions[sessionId].events[eventType].push({
        ...eventData,
        timestamp: eventData.timestamp || new Date().toISOString()
      });
      localStorage.setItem('learningSessions', JSON.stringify(sessions));
    }
  }
  
  /**
   * Obtém todas as sessões armazenadas localmente
   * @private
   */
  _getLocalSessions() {
    const sessionsJson = localStorage.getItem('learningSessions');
    return sessionsJson ? JSON.parse(sessionsJson) : {};
  }
  
  /**
   * Obtém uma sessão específica armazenada localmente
   * @private
   */
  _getLocalSession(sessionId) {
    const sessions = this._getLocalSessions();
    return sessions[sessionId] || null;
  }
}

export const learningProcessService = new LearningProcessService();
