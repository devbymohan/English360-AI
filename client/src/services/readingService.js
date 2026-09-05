import api from './api';
import { recordMeaningfulActivity } from '../utils/streakManager';

export const readingService = {
  getPassage: async (topic = null, level = 'B1', excludedTopics = [], sessionId = null, timestamp = Date.now()) => {
    try {
      const response = await api.post('/reading/generate', {
        topic,
        level,
        excludedTopics,
        sessionId,
        timestamp,
      });
      if (response.data?.data?.passage) {
        return response.data.data;
      }
    } catch (e) {}
    return null;
  },

  submitAttempt: async (attemptData) => {
    const {
      title = 'Reading Comprehension',
      wordCount = 300,
      readingTimeSeconds = 60,
      questions = [],
      answers = {},
    } = attemptData;

    let serverResult = null;
    try {
      const response = await api.post('/reading/submit', attemptData);
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

    const total = questions.length || 5;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const safeSeconds = Math.max(15, readingTimeSeconds);
    const wpm = Math.round(wordCount / (safeSeconds / 60));

    // Record meaningful learning activity
    const { streak } = recordMeaningfulActivity('reading', {
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
      wpm,
      readingTimeSeconds: safeSeconds,
      streak,
      evaluatedQuestions,
    };
  },
};
