import api from './api';

export const progressService = {
  getProgress: async () => {
    const response = await api.get('/progress');
    return response.data?.data;
  },
  getDashboard: async () => {
    const response = await api.get('/progress/dashboard');
    return response.data?.data;
  },
};
