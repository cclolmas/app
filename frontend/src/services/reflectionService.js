import { api } from './api';

/**
 * Serviço para gerenciar reflexões guiadas
 */
class ReflectionService {
  /**
   * Salva uma nova reflexão ou atualiza uma existente
   * @param {Object} reflection - Dados da reflexão
   * @returns {Promise<Object>} - Reflexão salva
   */
  async saveReflection(reflection) {
    try {
      const response = await api.post('/reflections', reflection);
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar reflexão:', error);
      throw error;
    }
  }

  /**
   * Compartilha uma reflexão publicamente
   * @param {Object} reflection - Dados da reflexão
   * @returns {Promise<Object>} - Reflexão compartilhada
   */
  async shareReflection(reflection) {
    try {
      const response = await api.post('/reflections/share', reflection);
      return response.data;
    } catch (error) {
      console.error('Erro ao compartilhar reflexão:', error);
      throw error;
    }
  }

  /**
   * Obtém reflexões do usuário atual
   * @param {Object} filters - Filtros opcionais (tipo de tarefa, data, etc)
   * @returns {Promise<Array>} - Lista de reflexões
   */
  async getUserReflections(filters = {}) {
    try {
      const response = await api.get('/reflections/user', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter reflexões do usuário:', error);
      throw error;
    }
  }

  /**
   * Obtém reflexões compartilhadas publicamente
   * @param {Object} filters - Filtros opcionais (tipo de tarefa, usuário, etc)
   * @returns {Promise<Array>} - Lista de reflexões compartilhadas
   */
  async getSharedReflections(filters = {}) {
    try {
      const response = await api.get('/reflections/shared', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter reflexões compartilhadas:', error);
      throw error;
    }
  }

  /**
   * Obtém uma reflexão específica por ID
   * @param {string} id - ID da reflexão
   * @returns {Promise<Object>} - Reflexão
   */
  async getReflectionById(id) {
    try {
      const response = await api.get(`/reflections/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao obter reflexão com ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Exclui uma reflexão
   * @param {string} id - ID da reflexão
   * @returns {Promise<void>}
   */
  async deleteReflection(id) {
    try {
      await api.delete(`/reflections/${id}`);
    } catch (error) {
      console.error(`Erro ao excluir reflexão com ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtém insights agregados de reflexões para um tipo de tarefa
   * @param {string} taskType - Tipo de tarefa ('fine-tuning', 'lmas')
   * @returns {Promise<Object>} - Dados agregados e insights
   */
  async getReflectionInsights(taskType) {
    try {
      const response = await api.get(`/reflections/insights/${taskType}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao obter insights para ${taskType}:`, error);
      throw error;
    }
  }
}

export const reflectionService = new ReflectionService();
