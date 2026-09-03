import api from './api';

export const readingService = {
  getPassage: async (topic = null, level = 'B1', excludedTopics = [], sessionId = null, timestamp = Date.now()) => {
    const response = await api.post('/reading/generate', {
      topic,
      level,
      excludedTopics,
      sessionId,
      timestamp,
    });
    return response.data?.data;
  },
  submitAttempt: async (attemptData) => {
    const response = await api.post('/reading/submit', attemptData);
    return response.data?.data;
  },
};
