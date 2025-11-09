// src/api/axiosContestClient.ts

import axios from "axios";

const axiosContestClient = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: { 
    "Content-Type": "application/json"
  }
});

// --- Request Interceptor ---
axiosContestClient.interceptors.request.use(
  (config) => {
    // Add Authorization Bearer token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 [ContestService] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
axiosContestClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [ContestService] ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.log(`❌ [ContestService] ${error.config?.url}`, error.response?.status);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.error('Authentication error - Please log in again');
      // Clear any existing auth data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Redirect to login page
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosContestClient;