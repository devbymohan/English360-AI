import mongoose from 'mongoose';
import User from '../models/User.js';
import LearningActivity from '../models/LearningActivity.js';
import Mistake from '../models/Mistake.js';
import Assessment from '../models/Assessment.js';
import GrammarProgress from '../models/GrammarProgress.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { userStore, getActivities, mistakeStore, getOrCreateUser } from '../utils/inMemoryStore.js';

// Helper to calculate real streak based on distinct consecutive learning days
const calculateStreak = (activities = []) => {
  if (!activities || activities.length === 0) return 0;

  const dates = new Set(
    activities.map((a) => new Date(a.createdAt).toISOString().split('T')[0])
  );

  const sortedDates = Array.from(dates).sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (!sortedDates.includes(today) && !sortedDates.includes(yesterday)) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date(sortedDates.includes(today) ? today : yesterday);

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (dates.has(dateStr)) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    } else {
      break;
    }
  }

  return streak;
};

export const getStudentProgress = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid;
    if (!userId) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    let user = null;
    let activities = [];
    let mistakesCount = 0;
    let grammarCount = 0;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ firebaseUid: userId });
        activities = await LearningActivity.find({ userId }).sort({ createdAt: -1 });
        mistakesCount = await Mistake.countDocuments({ userId });
        grammarCount = await GrammarProgress.countDocuments({ userId, completed: true });
      } catch (e) {
        console.warn('[ProgressController] DB fetch notice:', e.message);
      }
    }

    if (!user) {
      user = getOrCreateUser(userId, {
        name: req.user?.name || req.user?.displayName,
        email: req.user?.email,
      });
      activities = getActivities(userId);
      mistakesCount = (mistakeStore.get(userId) || []).length;
    }

    const level = user?.englishLevel || 'Not Assessed';
    const overallScore = user?.overallScore || 0;
    const assessmentCompleted = Boolean(user?.assessmentCompleted);
    const streak = calculateStreak(activities);

    const lessonsCompleted = activities.length;
    const questionsSolved = lessonsCompleted * 5;

    return successResponse(
      res,
      {
        userName: user?.name || req.user?.name || req.user?.displayName || 'Student',
        overallScore,
        englishLevel: level,
        levelProgress: overallScore,
        assessmentCompleted,
        streak,
        lessonsCompleted,
        questionsSolved,
        averageAccuracy: overallScore,
        grammarCompletedCount: grammarCount,
        recentActivities: activities.slice(0, 10).map((a) => ({
          title: a.title,
          type: a.type,
          score: a.score,
          date: new Date(a.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
        })),
        mistakesCount,
      },
      'Student progress retrieved successfully'
    );
  } catch (error) {
    console.error('[ProgressController] getStudentProgress error:', error.message);
    return errorResponse(res, error.message, 500);
  }
};

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid;
    if (!userId) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    let user = null;
    let activities = [];

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ firebaseUid: userId });
        activities = await LearningActivity.find({ userId }).sort({ createdAt: -1 });
      } catch (e) {
        console.warn('[ProgressController] DB fetch notice:', e.message);
      }
    }

    if (!user) {
      user = getOrCreateUser(userId, {
        name: req.user?.name || req.user?.displayName,
        email: req.user?.email,
      });
      activities = getActivities(userId);
    }

    const streak = calculateStreak(activities);
    const userName = user?.name || req.user?.name || req.user?.displayName || 'Student';
    const englishLevel = user?.englishLevel || 'Not Assessed';
    const overallScore = user?.overallScore || 0;
    const assessmentCompleted = Boolean(user?.assessmentCompleted);

    return successResponse(
      res,
      {
        user: {
          name: userName,
          englishLevel,
          overallScore,
          streak,
          assessmentCompleted,
        },
        streak,
        recentActivities: activities.slice(0, 5).map((a) => ({
          title: a.title,
          type: a.type,
          score: a.score,
          timeAgo: new Date(a.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
        })),
      },
      'Dashboard summary retrieved successfully'
    );
  } catch (error) {
    console.error('[ProgressController] getDashboardSummary error:', error.message);
    return errorResponse(res, error.message, 500);
  }
};
