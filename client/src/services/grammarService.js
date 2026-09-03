import api from './api';

export const grammarService = {
  getLesson: async (topic = 'Present Simple', level = 'B1', count = 5, sessionId = null, timestamp = Date.now()) => {
    const response = await api.post('/grammar/generate', { topic, level, count, sessionId, timestamp });
    return response.data?.data;
  },
  submitExercise: async (submissionData) => {
    const response = await api.post('/grammar/submit', submissionData);
    return response.data?.data;
  },
  getProgress: async () => {
    const response = await api.get('/grammar/progress');
    return response.data?.data;
  },
  resetProgress: async () => {
    const response = await api.post('/grammar/reset');
    return response.data?.data;
  },
};
