import api from './api';

export const aiCoachService = {
  chat: async (messages) => {
    const response = await api.post('/ai-coach/chat', { messages });
    return response.data?.data;
  },
  getRecommendations: async () => {
    const response = await api.get('/ai-coach/recommendations');
    return response.data?.data;
  },
};
