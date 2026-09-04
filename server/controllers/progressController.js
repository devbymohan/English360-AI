import mongoose from 'mongoose';
import User from '../models/User.js';
import LearningActivity from '../models/LearningActivity.js';
import Mistake from '../models/Mistake.js';
import Assessment from '../models/Assessment.js';
import GrammarProgress from '../models/GrammarProgress.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { userStore, getActivities, mistakeStore, getOrCreateUser, assessmentStore } from '../utils/inMemoryStore.js';
import { calculateRealStreak } from '../utils/streakHelper.js';

export const getStudentProgress = async (req, res) => {
  try {
    const timeZone = req.headers?.['x-timezone'] || req.query?.timezone || 'UTC';
    const userId = (req.firebaseUid && req.firebaseUid !== 'usr_guest_student')
      ? req.firebaseUid
      : (req.query?.firebaseUid || req.headers?.['x-firebase-uid'] || req.user?.uid);
    if (!userId) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    let user = null;
    let activities = [];
    let mistakesCount = 0;
    let grammarCount = 0;
    let latestAssessment = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ firebaseUid: userId });
        latestAssessment = await Assessment.findOne({ userId }).sort({ createdAt: -1 });
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

    const storedAssessment = assessmentStore.get(userId);
    const resolvedAssessment = latestAssessment || storedAssessment;

    // Automatic assessment reconciliation
    if (resolvedAssessment && (!user.assessmentCompleted || user.englishLevel === 'Not Assessed')) {
      user.assessmentCompleted = true;
      user.englishLevel = resolvedAssessment.level;
      user.overallScore = resolvedAssessment.overallScore || user.overallScore;

      if (mongoose.connection.readyState === 1) {
        try {
          await User.updateOne(
            { firebaseUid: userId },
            {
              $set: {
                assessmentCompleted: true,
                englishLevel: resolvedAssessment.level,
                overallScore: user.overallScore,
              },
            }
          );
        } catch (e) {}
      }
    }

    const level = user?.englishLevel || 'Not Assessed';
    const overallScore = user?.overallScore || 0;
    const assessmentCompleted = Boolean(user?.assessmentCompleted || resolvedAssessment);
    const streak = calculateRealStreak(activities, timeZone);

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
    const timeZone = req.headers?.['x-timezone'] || req.query?.timezone || 'UTC';
    const userId = (req.firebaseUid && req.firebaseUid !== 'usr_guest_student')
      ? req.firebaseUid
      : (req.query?.firebaseUid || req.headers?.['x-firebase-uid'] || req.user?.uid);
    if (!userId) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    let user = null;
    let activities = [];
    let latestAssessment = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ firebaseUid: userId });
        latestAssessment = await Assessment.findOne({ userId }).sort({ createdAt: -1 });
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

    const storedAssessment = assessmentStore.get(userId);
    const resolvedAssessment = latestAssessment || storedAssessment;

    // Automatic assessment reconciliation
    if (resolvedAssessment && (!user.assessmentCompleted || user.englishLevel === 'Not Assessed')) {
      user.assessmentCompleted = true;
      user.englishLevel = resolvedAssessment.level;
      user.overallScore = resolvedAssessment.overallScore || user.overallScore;

      if (mongoose.connection.readyState === 1) {
        try {
          await User.updateOne(
            { firebaseUid: userId },
            {
              $set: {
                assessmentCompleted: true,
                englishLevel: resolvedAssessment.level,
                overallScore: user.overallScore,
              },
            }
          );
        } catch (e) {}
      }
    }

    const streak = calculateRealStreak(activities, timeZone);
    const userName = user?.name || req.user?.name || req.user?.displayName || 'Student';
    const englishLevel = user?.englishLevel || 'Not Assessed';
    const overallScore = user?.overallScore || 0;
    const assessmentCompleted = Boolean(user?.assessmentCompleted || resolvedAssessment);

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

