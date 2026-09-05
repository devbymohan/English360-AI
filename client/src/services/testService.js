import api from './api';
import {
  recordMeaningfulActivity,
  saveClientModuleData,
  getClientModuleData,
} from '../utils/streakManager';

export const testService = {
  generateTest: async (category = 'Mixed', level = 'B1', count = 10, difficulty = 'Medium') => {
    try {
      const response = await api.post('/tests/generate', { category, level, count, difficulty });
      if (response.data?.data?.questions?.length) {
        return response.data.data;
      }
    } catch (e) {}
    return null;
  },

  submitTest: async (testData) => {
    const {
      testId = 'practice_exam',
      title = 'Comprehensive English Exam',
      questions = [],
      answers = {},
      timeTaken = '08:45',
    } = testData;

    let serverResult = null;
    try {
      const response = await api.post('/tests/submit', testData);
      if (response.data?.data) {
        serverResult = response.data.data;
      }
    } catch (e) {}

    // Local evaluation & scoring
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    const evaluatedQuestions = questions.map((q, idx) => {
      const userAns = answers[idx];
      if (!userAns) {
        skipped++;
        return {
          ...q,
          userAnswer: null,
          isCorrect: false,
          isSkipped: true,
        };
      }
      const isCorrect = userAns === q.correctAnswer;
      if (isCorrect) correct++;
      else incorrect++;
      return {
        ...q,
        userAnswer: userAns,
        isCorrect,
        isSkipped: false,
      };
    });

    const total = questions.length || 10;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const resultId = serverResult?.id || `test_res_${Date.now()}`;

    // Record meaningful learning activity
    const { streak } = recordMeaningfulActivity('test', {
      title,
      score,
      correctCount: correct,
      totalCount: total,
    });

    const localResult = {
      id: resultId,
      testId: title,
      title,
      score,
      accuracy: score,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      skippedAnswers: skipped,
      totalQuestions: total,
      timeTaken,
      streak,
      questions: evaluatedQuestions,
      createdAt: new Date().toISOString(),
    };

    // Save to local storage
    const allResults = getClientModuleData('test_results') || {};
    allResults[resultId] = localResult;
    allResults['recent'] = localResult;
    saveClientModuleData('test_results', allResults);
    saveClientModuleData('latest_test_result', localResult);

    return serverResult || localResult;
  },

  getResultById: async (id) => {
    try {
      if (id && id !== 'recent') {
        const response = await api.get(`/tests/results/${id}`);
        if (response.data?.data) return response.data.data;
      }
    } catch (e) {}

    // Fallback from client storage
    const allResults = getClientModuleData('test_results') || {};
    if (id && allResults[id]) {
      return allResults[id];
    }
    if (allResults['recent']) {
      return allResults['recent'];
    }
    return getClientModuleData('latest_test_result');
  },
};
