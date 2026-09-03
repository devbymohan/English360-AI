import api from './api';

export const listeningService = {
  getLesson: async (topic = null, level = 'B1', excludedLessons = [], sessionId = null, timestamp = Date.now()) => {
    const response = await api.post('/listening/generate', {
      topic,
      level,
      excludedLessons,
      sessionId,
      timestamp,
    });
    return response.data?.data;
  },
  submitAttempt: async (attemptData) => {
    const response = await api.post('/listening/submit', attemptData);
    return response.data?.data;
  },
};
