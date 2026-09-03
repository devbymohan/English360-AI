import api from './api';

export const vocabularyService = {
  getWords: async (level = 'B1', count = 5, excludedWords = [], sessionId = null, timestamp = Date.now()) => {
    const response = await api.post('/vocabulary/generate', {
      level,
      count,
      excludedWords,
      sessionId,
      timestamp,
    });
    return response.data?.data;
  },
  submitQuiz: async (quizData) => {
    const response = await api.post('/vocabulary/submit-quiz', quizData);
    return response.data?.data;
  },
  toggleBookmark: async (word) => {
    const response = await api.post('/vocabulary/bookmark', { word });
    return response.data?.data;
  },
  getBookmarks: async () => {
    const response = await api.get('/vocabulary/bookmarks');
    return response.data?.data;
  },
};
