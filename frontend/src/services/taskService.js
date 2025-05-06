import { v4 as uuidv4 } from 'uuid';
import { api } from './api';

/**
 * Serviço para gerenciar tarefas de longa duração como fine-tuning e LMAS
 */
class TaskService {
  /**
   * Iniciar um processo de fine-tuning
   * 
   * @param {Object} config - Configuração do fine-tuning
   * @param {Function} onProgress - Callback para atualizações de progresso
   * @param {Function} onLog - Callback para receber logs
   * @param {Function} onComplete - Callback quando concluído
   * @param {Function} onError - Callback quando ocorrer erro
   * @returns {string} taskId - ID da tarefa para rastreamento
   */
  async startFineTuning(config, onProgress, onLog, onComplete, onError) {
    const taskId = uuidv4();
    
    try {
      // Iniciar o fine-tuning no backend com um ID de tarefa para rastrear
      const response = await api.post('/fine-tuning/start', {
        ...config,
        taskId
      });
      
      // Iniciar polling para atualizações de status
      this._pollTaskStatus(
        taskId, 
        '/fine-tuning/status', 
        onProgress, 
        onLog,
        onComplete, 
        onError
      );
      
      return taskId;
    } catch (error) {
      if (onError) onError(error);
      throw error;
    }
  }
  
  /**
   * Iniciar um processo de LMAS
   * 
   * @param {Object} config - Configuração do LMAS
   * @param {Function} onProgress - Callback para atualizações de progresso
   * @param {Function} onLog - Callback para receber logs
   * @param {Function} onComplete - Callback quando concluído
   * @param {Function} onError - Callback quando ocorrer erro
   * @returns {string} taskId - ID da tarefa para rastreamento
   */
  async startLMAS(config, onProgress, onLog, onComplete, onError) {
    const taskId = uuidv4();
    
    try {
      // Iniciar o LMAS no backend com um ID de tarefa para rastrear
      const response = await api.post('/lmas/start', {
        ...config,
        taskId
      });
      
      // Iniciar polling para atualizações de status
      this._pollTaskStatus(
        taskId, 
        '/lmas/status', 
        onProgress, 
        onLog,
        onComplete, 
        onError
      );
      
      return taskId;
    } catch (error) {
      if (onError) onError(error);
      throw error;
    }
  }
  
  /**
   * Verificar o status de uma tarefa
   * 
   * @param {string} taskId - ID da tarefa
   * @param {string} taskType - Tipo da tarefa ('fine-tuning', 'lmas')
   * @returns {Promise<Object>} - Status da tarefa
   */
  async checkTaskStatus(taskId, taskType) {
    try {
      const endpoint = taskType === 'fine-tuning' 
        ? '/fine-tuning/status' 
        : '/lmas/status';
        
      const response = await api.get(`${endpoint}/${taskId}`);
      return response.data;
    } catch (error) {
      console.error(`Error checking status for task ${taskId}:`, error);
      throw error;
    }
  }
  
  /**
   * Cancelar uma tarefa em andamento
   * 
   * @param {string} taskId - ID da tarefa
   * @param {string} taskType - Tipo da tarefa ('fine-tuning', 'lmas')
   * @returns {Promise<boolean>} - Se foi cancelada com sucesso
   */
  async cancelTask(taskId, taskType) {
    try {
      const endpoint = taskType === 'fine-tuning' 
        ? '/fine-tuning/cancel' 
        : '/lmas/cancel';
        
      const response = await api.post(`${endpoint}/${taskId}`);
      return true;
    } catch (error) {
      console.error(`Error canceling task ${taskId}:`, error);
      throw error;
    }
  }
  
  /**
   * Método privado para fazer polling do status da tarefa
   */
  _pollTaskStatus(taskId, endpoint, onProgress, onLog, onComplete, onError) {
    let pollInterval = 2000; // Iniciar com 2 segundos
    const maxPollInterval = 10000; // Máximo de 10 segundos
    const progressThreshold = 0.05; // 5% de mudança para aumentar o intervalo
    let lastProgress = 0;
    let lastLogCount = 0;
    
    const checkStatus = async () => {
      try {
        const response = await api.get(`${endpoint}/${taskId}`);
        const status = response.data;
        
        // Verificar se há novos logs
        if (status.logs && onLog && status.logs.length > lastLogCount) {
          const newLogs = status.logs.slice(lastLogCount);
          newLogs.forEach(log => onLog(log));
          lastLogCount = status.logs.length;
        }
        
        // Verificar estado da tarefa
        if (status.status === 'completed') {
          if (onComplete) onComplete(status.result);
          return; // Parar o polling
        } else if (status.status === 'failed') {
          if (onError) onError(new Error(status.error || 'Task failed'));
          return; // Parar o polling
        }
        
        // Atualizar progresso
        if (onProgress && status.progress !== undefined) {
          onProgress(status.progress, status);
          
          // Ajustar intervalo de polling com base na mudança de progresso
          if (Math.abs(status.progress - lastProgress) < progressThreshold) {
            // Progresso está lento, aumentar intervalo (para economizar recursos)
            pollInterval = Math.min(pollInterval * 1.5, maxPollInterval);
          } else {
            // Progresso está rápido, manter ou diminuir intervalo
            pollInterval = Math.max(2000, pollInterval * 0.8);
          }
          
          lastProgress = status.progress;
        }
        
        // Continuar o polling
        setTimeout(checkStatus, pollInterval);
      } catch (error) {
        if (onError) onError(error);
        
        // Em caso de erro, tentar novamente com um intervalo maior
        pollInterval = Math.min(pollInterval * 2, maxPollInterval);
        setTimeout(checkStatus, pollInterval);
      }
    };
    
    // Iniciar o loop de polling
    setTimeout(checkStatus, 1000);
  }
}

export const taskService = new TaskService();
