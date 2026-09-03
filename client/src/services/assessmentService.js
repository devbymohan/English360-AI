import api from './api';

export const assessmentService = {
  getAssessment: async (level = 'B1') => {
    const response = await api.post('/assessment/generate', { level });
    return response.data?.data;
  },
  submitAssessment: async (resultsData) => {
    const response = await api.post('/assessment/submit', resultsData);
    return response.data?.data;
  },
};
