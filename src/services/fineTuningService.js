import axios from 'axios';

// Configuração base do axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Função para iniciar uma tarefa de fine-tuning
 * @param {Object} config Configuração para o processo de fine-tuning
 * @returns {Promise} Resposta da API
 */
export const startFineTuningTask = async (config) => {
  try {
    // Validação adicional antes de enviar para a API
    validateFineTuningConfig(config);
    
    // Chamada à API para iniciar o processo
    const response = await api.post('/fine-tuning/start', config);
    
    return response.data;
  } catch (error) {
    console.error('Erro ao iniciar fine-tuning:', error);
    
    // Melhorar a mensagem de erro com base na resposta da API
    if (error.response) {
      throw new Error(error.response.data.message || 'Erro no servidor ao processar sua solicitação');
    }
    
    // Erro de rede ou outro problema
    throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
  }
};

/**
 * Função para verificar status de uma tarefa em andamento
 * @param {string} taskId ID da tarefa de fine-tuning
 * @returns {Promise} Status da tarefa
 */
export const checkFineTuningStatus = async (taskId) => {
  try {
    const response = await api.get(`/fine-tuning/status/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    throw new Error('Falha ao verificar status da tarefa');
  }
};

/**
 * Validação da configuração de fine-tuning
 */
const validateFineTuningConfig = (config) => {
  if (!config) {
    throw new Error('Configuração não fornecida');
  }
  
  const { model, trainingData, epochs, learningRate } = config;
  
  if (!model) {
    throw new Error('Modelo base não especificado');
  }
  
  if (!trainingData) {
    throw new Error('Dados de treinamento não fornecidos');
  }
  
  if (!epochs || epochs < 1) {
    throw new Error('Número de épocas deve ser pelo menos 1');
  }
  
  if (learningRate && (learningRate <= 0 || learningRate > 1)) {
    throw new Error('Taxa de aprendizado deve estar entre 0 e 1');
  }
  
  return true;
};
