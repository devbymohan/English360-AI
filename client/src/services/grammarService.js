import api from './api';
import {
  recordMeaningfulActivity,
  getClientModuleData,
  saveClientModuleData,
} from '../utils/streakManager';

export const grammarService = {
  getLesson: async (topic = 'Present Simple', level = 'B1', count = 5, sessionId = null, timestamp = Date.now()) => {
    try {
      const response = await api.post('/grammar/generate', { topic, level, count, sessionId, timestamp });
      if (response.data?.data?.questions?.length) {
        return response.data.data;
      }
    } catch (e) {}
    return null;
  },

  submitExercise: async (submissionData) => {
    const { topic, level, questions = [], answers = {}, sessionId } = submissionData;
    let serverResult = null;

    try {
      const response = await api.post('/grammar/submit', submissionData);
      if (response.data?.data) {
        serverResult = response.data.data;
      }
    } catch (e) {
      // Backend unavailable on Vercel
    }

    // Local evaluation & scoring
    let correct = 0;
    let wrong = 0;
    const evaluatedQuestions = questions.map((q, idx) => {
      const userAns = answers[idx];
      const isCorrect = userAns === q.correctAnswer;
      if (isCorrect) correct++;
      else wrong++;
      return {
        ...q,
        userAnswer: userAns,
        isCorrect,
      };
    });

    const total = questions.length || 5;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Load existing grammar progress
    const existing = getClientModuleData('grammar_progress') || {
      completedTopics: [],
      topicBreakdown: [],
      overallPerformance: {
        totalQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        overallAccuracy: 0,
      },
    };

    // Update topic breakdown
    const topicBreakdown = [...(existing.topicBreakdown || [])];
    const existingIdx = topicBreakdown.findIndex(
      (tb) => tb.topic === topic || tb.topic.replace(/\s+/g, '') === topic.replace(/\s+/g, '')
    );

    const topicEntry = {
      topic,
      level: level || 'B1',
      attempted: total,
      correct,
      wrong,
      accuracy,
      completed: true,
      updatedAt: Date.now(),
    };

    if (existingIdx >= 0) {
      topicBreakdown[existingIdx] = topicEntry;
    } else {
      topicBreakdown.push(topicEntry);
    }

    // Update completed topics list
    const completedTopics = Array.from(new Set([...(existing.completedTopics || []), topic]));

    // Calculate aggregated overall performance across all attempted topics
    let totalQuestions = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;

    topicBreakdown.forEach((tb) => {
      totalQuestions += tb.attempted || 0;
      correctAnswers += tb.correct || 0;
      wrongAnswers += tb.wrong || 0;
    });

    const overallAccuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    const overallPerformance = {
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      overallAccuracy,
    };

    const savedProgress = {
      completedTopics,
      topicBreakdown,
      overallPerformance,
      lastUpdated: Date.now(),
    };

    saveClientModuleData('grammar_progress', savedProgress);

    // Record meaningful learning activity
    const { streak } = recordMeaningfulActivity('grammar', {
      title: `${topic} Practice`,
      score: accuracy,
      correctCount: correct,
      totalCount: total,
    });

    return serverResult || {
      success: true,
      topic,
      level,
      score: accuracy,
      accuracy,
      correct,
      wrong,
      total,
      questions: evaluatedQuestions,
      topicBreakdown,
      overallPerformance,
      completedTopics,
      streak,
    };
  },

  getProgress: async () => {
    try {
      const response = await api.get('/grammar/progress');
      if (response.data?.data) {
        return response.data.data;
      }
    } catch (e) {}

    // Return stored client progress
    const clientProgress = getClientModuleData('grammar_progress');
    if (clientProgress) {
      return clientProgress;
    }

    // Default baseline
    return {
      completedTopics: [],
      topicBreakdown: [],
      overallPerformance: {
        totalQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        overallAccuracy: 0,
      },
    };
  },

  resetProgress: async () => {
    try {
      await api.post('/grammar/reset');
    } catch (e) {}
    const empty = {
      completedTopics: [],
      topicBreakdown: [],
      overallPerformance: {
        totalQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        overallAccuracy: 0,
      },
    };
    saveClientModuleData('grammar_progress', empty);
    return empty;
  },
};
