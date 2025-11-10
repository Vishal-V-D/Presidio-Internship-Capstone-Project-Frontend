// src/api/axiosSubmissionClient.ts
import axios from "axios";

const axiosSubmissionClient = axios.create({
  baseURL: "http://quantum-judge-alb-dev-233767472.us-east-1.elb.amazonaws.com:5000/api",
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
      console.log(`🚀 [SubmissionService] ${config.method?.toUpperCase()} ${config.url} [Auth: ✓]`);
    } else {
      console.warn(`⚠️ [SubmissionService] ${config.method?.toUpperCase()} ${config.url} [Auth: ✗ - No token found]`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [SubmissionService] Request Error:', error);
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
    const url = error.config?.url;
    const status = error.response?.status;
    
    console.log(`❌ [SubmissionService] ${url}`, status);
    
    // Handle 401 Unauthorized
    if (status === 401) {
      const hadToken = error.config?.headers?.Authorization;
      
      if (hadToken) {
        // Token was sent but rejected
        console.error('🔒 [SubmissionService] 401 - Authentication failed');
        console.warn('⚠️ [SubmissionService] Letting component handle auth error - no auto-redirect');
        // Don't auto-redirect for submission service - let component handle it
        // This prevents logout during Run/Submit operations
      } else {
        // No token was sent - this is a request issue, not an auth issue
        console.warn('⚠️ [SubmissionService] 401 but no token was sent - possible race condition');
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosSubmissionClient;
