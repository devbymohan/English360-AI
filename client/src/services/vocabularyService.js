import api from './api';
import {
  recordMeaningfulActivity,
  saveClientModuleData,
  getClientModuleData,
} from '../utils/streakManager';

export const vocabularyService = {
  getWords: async (level = 'B1', count = 5, excludedWords = [], sessionId = null, timestamp = Date.now()) => {
    try {
      const response = await api.post('/vocabulary/generate', {
        level,
        count,
        excludedWords,
        sessionId,
        timestamp,
      });
      if (response.data?.data?.length) {
        return response.data.data;
      }
    } catch (e) {}
    return null;
  },

  submitQuiz: async (quizData) => {
    const { words = [], answers = {} } = quizData;
    let serverResult = null;

    try {
      const response = await api.post('/vocabulary/submit-quiz', quizData);
      if (response.data?.data) {
        serverResult = response.data.data;
      }
    } catch (e) {}

    // Local evaluation & scoring
    let correct = 0;
    const evaluatedWords = words.map((w, idx) => {
      const userAns = answers[idx];
      const expected = w.practiceQuestion?.correctAnswer || 'A';
      const isCorrect = userAns === expected;
      if (isCorrect) correct++;
      return {
        word: w.word,
        userAnswer: userAns,
        correctAnswer: expected,
        isCorrect,
      };
    });

    const total = words.length || 5;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const wrongCount = total - correct;

    // Record meaningful learning activity
    const { streak } = recordMeaningfulActivity('vocabulary', {
      title: 'Vocabulary Practice Quiz',
      score,
      correctCount: correct,
      totalCount: total,
    });

    return serverResult || {
      success: true,
      score,
      correctCount: correct,
      wrongCount,
      total,
      mistakesCount: wrongCount,
      streak,
      evaluatedWords,
    };
  },

  toggleBookmark: async (word) => {
    try {
      const response = await api.post('/vocabulary/bookmark', { word });
      if (response.data?.data) return response.data.data;
    } catch (e) {}

    const bookmarks = getClientModuleData('vocab_bookmarks') || [];
    const exists = bookmarks.some((b) => (typeof b === 'string' ? b === word : b.word === word));
    let updated;
    if (exists) {
      updated = bookmarks.filter((b) => (typeof b === 'string' ? b !== word : b.word !== word));
    } else {
      updated = [...bookmarks, word];
    }
    saveClientModuleData('vocab_bookmarks', updated);
    return updated;
  },

  getBookmarks: async () => {
    try {
      const response = await api.get('/vocabulary/bookmarks');
      if (response.data?.data) return response.data.data;
    } catch (e) {}
    return getClientModuleData('vocab_bookmarks') || [];
  },
};
