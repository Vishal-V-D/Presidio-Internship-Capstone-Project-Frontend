// src/api/axiosSubmissionClient.ts
import axios from "axios";

const axiosSubmissionClient = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { 
    "Content-Type": "application/json"
  }
});

// Request interceptor
axiosSubmissionClient.interceptors.request.use(
  (config) => {
    // Add Authorization Bearer token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 [SubmissionService] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Submission Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosSubmissionClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [SubmissionService] ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.log(`❌ [SubmissionService] ${error.config?.url}`, error.response?.status);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.error('Submission authentication error - Please log in again');
      // Clear any existing auth data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Redirect to login page
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosSubmissionClient;
