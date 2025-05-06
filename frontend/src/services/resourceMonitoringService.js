import axios from 'axios';
import { API_BASE_URL } from '../config';

// Fetch resource usage data
export const fetchResourceUsageData = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/resource-monitoring/usage`, { 
      params: filters 
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching resource usage data:", error);
    throw error;
  }
};

// Fetch computational flow data
export const fetchFlowData = async (config = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/resource-monitoring/flow`, { 
      params: config 
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching computational flow data:", error);
    throw error;
  }
};

// Fetch comparison data for resource usage
export const fetchResourceComparisonData = async (comparisonConfig) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/resource-monitoring/usage/compare`, { 
      params: comparisonConfig 
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching resource comparison data:", error);
    throw error;
  }
};

// Fetch comparison data for computational flow
export const fetchFlowComparisonData = async (comparisonConfig) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/resource-monitoring/flow/compare`, { 
      params: comparisonConfig 
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching flow comparison data:", error);
    throw error;
  }
};

// Submit new resource monitoring data
export const submitResourceMonitoringData = async (monitoringData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/resource-monitoring/record`, monitoringData);
    return response.data;
  } catch (error) {
    console.error("Error submitting resource monitoring data:", error);
    throw error;
  }
};

// Get resource monitoring statistics
export const fetchResourceStats = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/resource-monitoring/stats`, { 
      params 
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching resource statistics:", error);
    throw error;
  }
};
