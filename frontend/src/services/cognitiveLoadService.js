import axios from 'axios';
import { API_BASE_URL } from '../config';

// Fetch the current user's cognitive load data
export const fetchUserCognitiveData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/cognitive-load/user`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user cognitive load data:", error);
    throw error;
  }
};

// Fetch cognitive load data for class comparison
export const fetchClassCognitiveData = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/cognitive-load/class`, { 
      params: filters 
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching class cognitive load data:", error);
    throw error;
  }
};

// Submit new cognitive load assessment
export const submitCognitiveLoadAssessment = async (assessmentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/cognitive-load/assessment`, assessmentData);
    return response.data;
  } catch (error) {
    console.error("Error submitting cognitive load assessment:", error);
    throw error;
  }
};

// Fetch cognitive load statistics and analysis
export const fetchCognitiveLoadStats = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/cognitive-load/stats`, { 
      params 
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching cognitive load statistics:", error);
    throw error;
  }
};
