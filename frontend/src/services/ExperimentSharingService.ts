import { SharedExperiment, ExperimentType } from '../types/ExperimentTypes';
import { api } from './api';

class ExperimentSharingService {
  /**
   * Obter todos os experimentos compartilhados
   */
  async getSharedExperiments(filters?: {
    type?: ExperimentType,
    tags?: string[],
    userId?: string,
    classroomId?: string,
    visibility?: 'public' | 'private' | 'classroom'
  }): Promise<SharedExperiment[]> {
    try {
      const response = await api.get('/experiments/shared', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch shared experiments:', error);
      throw error;
    }
  }

  /**
   * Obter experimento por ID
   */
  async getExperimentById(id: string): Promise<SharedExperiment> {
    try {
      const response = await api.get(`/experiments/shared/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch experiment with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Compartilhar um novo experimento
   */
  async shareExperiment(experiment: Omit<SharedExperiment, 'id' | 'createdAt' | 'updatedAt'>): Promise<SharedExperiment> {
    try {
      const response = await api.post('/experiments/shared', experiment);
      return response.data;
    } catch (error) {
      console.error('Failed to share experiment:', error);
      throw error;
    }
  }

  /**
   * Atualizar um experimento existente
   */
  async updateExperiment(id: string, updates: Partial<SharedExperiment>): Promise<SharedExperiment> {
    try {
      const response = await api.put(`/experiments/shared/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Failed to update experiment with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Adicionar uma anotação a um experimento
   */
  async addAnnotation(experimentId: string, annotation: {
    text: string;
    position?: { x: number, y: number };
    targetMetric?: string;
  }): Promise<SharedExperiment> {
    try {
      const response = await api.post(`/experiments/shared/${experimentId}/annotations`, annotation);
      return response.data;
    } catch (error) {
      console.error(`Failed to add annotation to experiment ${experimentId}:`, error);
      throw error;
    }
  }

  /**
   * Obter experimentos semelhantes (para comparação)
   */
  async getSimilarExperiments(experimentId: string, limit = 5): Promise<SharedExperiment[]> {
    try {
      const response = await api.get(`/experiments/shared/${experimentId}/similar`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get similar experiments for ${experimentId}:`, error);
      throw error;
    }
  }
  
  /**
   * Obter um sumário de tendências e padrões de experimentos
   */
  async getExperimentPatterns(filters?: {
    type?: ExperimentType,
    metric?: string,
    parameter?: string
  }): Promise<any> {
    try {
      const response = await api.get('/experiments/shared/patterns', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get experiment patterns:', error);
      throw error;
    }
  }
}

export const experimentSharingService = new ExperimentSharingService();
