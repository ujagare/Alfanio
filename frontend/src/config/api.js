import axios from 'axios';
import { API_URL as API_BASE_URL } from '../config';

export const API_URL = import.meta.env.VITE_API_URL || API_BASE_URL;

export const API_ENDPOINTS = {
  contact: `${API_URL}/api/contact`,
  brochure: `${API_URL}/api/contact/brochure`,
  download: `${API_URL}/brochures/download`
};

// Create axios instance with better error handling
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000,
  withCredentials: true
});

// Add response interceptors
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
    throw error;
  }
);

export { apiClient as axios };
