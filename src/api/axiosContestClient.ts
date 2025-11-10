// src/api/axiosContestClient.ts

import axios from "axios";

const axiosContestClient = axios.create({
  baseURL: "http://quantum-judge-alb-dev-233767472.us-east-1.elb.amazonaws.com:4000/api",
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
      console.log(`🚀 [ContestService] ${config.method?.toUpperCase()} ${config.url} [Auth: ✓]`);
    } else {
      console.warn(`⚠️ [ContestService] ${config.method?.toUpperCase()} ${config.url} [Auth: ✗ - No token found]`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [ContestService] Request Error:', error);
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
    const url = error.config?.url;
    const status = error.response?.status;
    
    console.log(`❌ [ContestService] ${url}`, status);
    
    // Handle 401 Unauthorized - Only clear auth if token was actually sent
    if (status === 401) {
      const hadToken = error.config?.headers?.Authorization;
      
      if (hadToken) {
        // Token was sent but rejected - it's invalid/expired
        console.error('🔒 [ContestService] Token rejected by server - clearing auth data');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else {
        // No token was sent - this is a request issue, not an auth issue
        console.warn('⚠️ [ContestService] 401 but no token was sent - possible race condition');
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosContestClient;