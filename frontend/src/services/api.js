import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Configuração do cliente axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
});

// Interceptor para tratamento de erros
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

// Funções para obter métricas do sistema
export const getSystemMetrics = async () => {
  try {
    const response = await apiClient.get('/system/metrics');
    return response.data;
  } catch (error) {
    console.error('Failed to get system metrics:', error);
    // Valores default caso a API falhe
    return {
      ram: { used: 0, total: 8 * 1024 * 1024 * 1024 },
      vram: { used: 0, total: 4 * 1024 * 1024 * 1024 },
      cpu: { usage: 0 },
      gpu: { usage: 0 },
      activeTasksEstimatedTime: 0
    };
  }
};

// Função para obter detalhes do projeto
export const getProjectStatus = async (projectId) => {
  try {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get project ${projectId}:`, error);
    // Objeto mínimo para evitar erros de UI
    return {
      id: projectId,
      name: 'Projeto não encontrado',
      modelConfig: {
        name: 'N/A',
        quantization: null,
        parameters: 'N/A',
        contextSize: 'N/A'
      }
    };
  }
};

// Função para salvar avaliação de carga cognitiva
export const saveCognitiveLoadRating = async (projectId, value) => {
  try {
    const response = await apiClient.post('/system/cognitive-load', {
      project_id: projectId,
      value,
      timestamp: Date.now()
    });
    return response.data;
  } catch (error) {
    console.error('Failed to save cognitive load rating:', error);
    throw error;
  }
};

// Outras funções da API podem ser adicionadas aqui
