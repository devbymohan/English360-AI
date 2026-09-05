import api from './api';
import { getClientModuleData, saveClientModuleData } from '../utils/streakManager';

export const mistakeService = {
  getMistakes: async (params = {}) => {
    try {
      const response = await api.get('/mistakes', { params });
      if (response.data?.data) return response.data.data;
    } catch (e) {}

    const stored = getClientModuleData('user_mistakes') || [];
    if (params?.category && params.category !== 'All') {
      return stored.filter((m) => m.category === params.category);
    }
    return stored;
  },

  recordMistake: (mistake) => {
    const stored = getClientModuleData('user_mistakes') || [];
    const entry = {
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      category: mistake.category || 'General',
      question: mistake.question || mistake.prompt || mistake.sentence || 'Question',
      userAnswer: mistake.userAnswer || '',
      correctAnswer: mistake.correctAnswer || '',
      explanation: mistake.explanation || 'Review the grammar rule or word definition.',
      topic: mistake.topic || '',
      reviewed: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [entry, ...stored].slice(0, 50);
    saveClientModuleData('user_mistakes', updated);
    return entry;
  },

  markReviewed: async (id) => {
    try {
      const response = await api.put(`/mistakes/${id}/review`);
      if (response.data?.data) return response.data.data;
    } catch (e) {}

    const stored = getClientModuleData('user_mistakes') || [];
    const updated = stored.map((m) => (m.id === id ? { ...m, reviewed: true } : m));
    saveClientModuleData('user_mistakes', updated);
    return { success: true };
  },

  getStats: async () => {
    try {
      const response = await api.get('/mistakes/stats');
      if (response.data?.data) return response.data.data;
    } catch (e) {}

    const stored = getClientModuleData('user_mistakes') || [];
    const total = stored.length;
    const reviewed = stored.filter((m) => m.reviewed).length;
    return {
      totalMistakes: total,
      reviewedMistakes: reviewed,
      pendingReview: total - reviewed,
    };
  },
};
