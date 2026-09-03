import api from './api';

export const mistakeService = {
  getMistakes: async (params = {}) => {
    const response = await api.get('/mistakes', { params });
    return response.data?.data;
  },
  markReviewed: async (id) => {
    const response = await api.put(`/mistakes/${id}/review`);
    return response.data?.data;
  },
  getStats: async () => {
    const response = await api.get('/mistakes/stats');
    return response.data?.data;
  },
};
