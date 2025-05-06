import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const fetchComputationalMetrics = async () => {
  try {
    const response = await axios.get(`${API_URL}/system-metrics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching computational metrics:', error);
    throw error;
  }
};

export const recordCognitiveLoad = async (userId, taskId, loadValue) => {
  try {
    const response = await axios.post(`${API_URL}/cognitive-load`, {
      userId,
      taskId,
      loadValue,
      timestamp: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error recording cognitive load:', error);
    throw error;
  }
};

export const fetchOptimalPoint = async (taskType, userExperienceLevel) => {
  try {
    const response = await axios.get(`${API_URL}/optimal-point`, {
      params: { taskType, userExperienceLevel }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching optimal point:', error);
    throw error;
  }
};
