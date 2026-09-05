import api from './api';
import {
  getClientStreak,
  getClientActivities,
  getClientModuleData,
  getActiveUid,
} from '../utils/streakManager';
import { getCachedProfile } from '../context/AuthContext';

const buildClientAnalytics = () => {
  const uid = getActiveUid();
  const profile = getCachedProfile(uid) || {};
  const activities = getClientActivities(uid);
  const streak = getClientStreak(uid);

  let totalQuestions = 0;
  let totalScore = 0;
  activities.forEach((a) => {
    totalQuestions += a.totalCount || 5;
    totalScore += a.score || 80;
  });

  const grammarProgress = getClientModuleData('grammar_progress', uid);
  const grammarLessons = grammarProgress?.completedTopics?.length || 0;
  const lessonsCompleted = Math.max(activities.length, grammarLessons);
  const questionsSolved = Math.max(totalQuestions, grammarProgress?.overallPerformance?.totalQuestions || 0);
  const avgAcc = activities.length > 0
    ? Math.round(totalScore / activities.length)
    : (profile?.overallScore || 75);

  const formattedActivities = activities.slice(0, 10).map((act) => {
    const d = new Date(act.timestamp || Date.now());
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return {
      id: act.id,
      title: act.title,
      type: act.type,
      score: typeof act.score === 'number' ? `${act.score}%` : (act.score || '100%'),
      timestamp: act.timestamp,
      formattedDate: `${dateStr} • ${timeStr}`,
      timeAgo: `${dateStr} • ${timeStr}`,
      date: dateStr,
    };
  });

  return {
    streak,
    lessonsCompleted,
    questionsSolved,
    averageAccuracy: avgAcc,
    overallScore: profile.overallScore || avgAcc,
    englishLevel: profile.level || profile.englishLevel || 'A2',
    recentActivities: formattedActivities,
    user: {
      ...profile,
      streak,
      englishLevel: profile.level || profile.englishLevel || 'A2',
      overallScore: profile.overallScore || avgAcc,
    },
  };
};

export const progressService = {
  getProgress: async () => {
    try {
      const response = await api.get('/progress');
      if (response.data?.data) {
        return response.data.data;
      }
    } catch (e) {}
    return buildClientAnalytics();
  },

  getDashboard: async () => {
    try {
      const response = await api.get('/progress/dashboard');
      if (response.data?.data) {
        return response.data.data;
      }
    } catch (e) {}
    return buildClientAnalytics();
  },
};
