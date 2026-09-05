import api from './api';
import { recordMeaningfulActivity } from '../utils/streakManager';

export const writingService = {
  evaluate: async (topic, content, level = 'B1') => {
    let serverResult = null;
    try {
      const response = await api.post('/writing/evaluate', { topic, content, level });
      if (response.data?.data) {
        serverResult = response.data.data;
      }
    } catch (e) {}

    const score = serverResult?.overallScore || 75;
    const { streak } = recordMeaningfulActivity('writing', {
      title: `Writing: ${topic}`,
      score,
    });

    if (serverResult) {
      return { ...serverResult, streak };
    }
    return null;
  },
};
