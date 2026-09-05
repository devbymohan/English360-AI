import api from './api';
import { recordMeaningfulActivity } from '../utils/streakManager';

export const listeningService = {
  getLesson: async (topic = null, level = 'B1', excludedLessons = [], sessionId = null, timestamp = Date.now()) => {
    try {
      const response = await api.post('/listening/generate', {
        topic,
        level,
        excludedLessons,
        sessionId,
        timestamp,
      });
      if (response.data?.data?.questions?.length) {
        return response.data.data;
      }
    } catch (e) {}
    return null;
  },

  submitAttempt: async (attemptData) => {
    const {
      title = 'Listening Comprehension',
      questions = [],
      answers = {},
    } = attemptData;

    let serverResult = null;
    try {
      const response = await api.post('/listening/submit', attemptData);
      if (response.data?.data) {
        serverResult = response.data.data;
      }
    } catch (e) {}

    // Local evaluation & scoring
    let correct = 0;
    const evaluatedQuestions = questions.map((q, idx) => {
      const userAns = answers[idx];
      const isCorrect = userAns === q.correctAnswer;
      if (isCorrect) correct++;
      return {
        ...q,
        userAnswer: userAns,
        isCorrect,
      };
    });

    const total = questions.length || 10;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Record meaningful learning activity
    const { streak } = recordMeaningfulActivity('listening', {
      title,
      score: accuracy,
      correctCount: correct,
      totalCount: total,
    });

    return serverResult || {
      success: true,
      score: accuracy,
      accuracy,
      correctCount: correct,
      wrongCount: total - correct,
      total,
      streak,
      evaluatedQuestions,
    };
  },
};
