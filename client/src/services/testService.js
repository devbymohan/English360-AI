import api from './api';

export const testService = {
  generateTest: async (category = 'Mixed', level = 'B1', count = 10, difficulty = 'Medium') => {
    const response = await api.post('/tests/generate', { category, level, count, difficulty });
    return response.data?.data;
  },
  submitTest: async (testData) => {
    const response = await api.post('/tests/submit', testData);
    return response.data?.data;
  },
  getResultById: async (id) => {
    const response = await api.get(`/tests/results/${id}`);
    return response.data?.data;
  },
};
