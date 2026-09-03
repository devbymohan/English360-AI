import axios from 'axios';
import { auth } from '../config/firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Central Request Interceptor: Automatically attach Firebase ID token
api.interceptors.request.use(
  async (config) => {
    try {
      if (auth && auth.currentUser) {
        const token = await auth.currentUser.getIdToken(false);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }
      }

      // Fallback token from localStorage
      const storedToken = localStorage.getItem('token') || localStorage.getItem('english360_auth_token');
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.warn('[API Interceptor] Token retrieval notice:', error.message);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthenticated / expired token
      console.warn('[API] 401 Unauthorized response from server');
    }
    return Promise.reject(error);
  }
);

export default api;
