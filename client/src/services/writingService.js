import api from './api';

export const writingService = {
  evaluate: async (topic, content, level = 'B1') => {
    const response = await api.post('/writing/evaluate', { topic, content, level });
    return response.data?.data;
  },
};
