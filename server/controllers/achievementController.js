import { successResponse } from '../utils/responseHandler.js';

export const getAchievements = async (req, res) => {
  return successResponse(res, {
    totalPoints: 2410,
    unlockedCount: 24,
    inProgressCount: 3,
    streakDays: 12,
  }, 'Achievements retrieved');
};
