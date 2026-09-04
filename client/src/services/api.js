import axios from 'axios';
import { auth } from '../config/firebase';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    // Ensure trailing slash isn't doubled
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  // If running in browser on production (e.g. Vercel) without env var, warn and try relative
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds for Render wakeups & AI generations
});

// Central Request Interceptor: Automatically attach Firebase ID token or student token
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
      const storedToken =
        localStorage.getItem('token') ||
        localStorage.getItem('english360_auth_token') ||
        localStorage.getItem('english360_user_uid');

      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      } else {
        config.headers.Authorization = `Bearer usr_guest_student`;
      }
    } catch (error) {
      config.headers.Authorization = `Bearer usr_guest_student`;
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
