import mongoose from 'mongoose';
import Mistake from '../models/Mistake.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { getMistakesForUser, markMistakeReviewedLocal, mistakeStore } from '../utils/inMemoryStore.js';

export const getMistakes = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid || 'guest';
    const { category, search, reviewed } = req.query || {};

    const query = { userId };
    if (category && category !== 'All') {
      query.category = category;
    }
    if (reviewed !== undefined) {
      query.reviewed = reviewed === 'true';
    }
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { explanation: { $regex: search, $options: 'i' } },
      ];
    }

    let mistakes = [];
    if (mongoose.connection.readyState === 1) {
      try {
        mistakes = await Mistake.find(query).sort({ createdAt: -1 }).limit(50);
      } catch (e) {
        console.warn('[Mistakes] DB fetch notice:', e.message);
      }
    }

    if (mistakes.length === 0) {
      mistakes = getMistakesForUser(userId, {
        category,
        search,
        reviewed: reviewed !== undefined ? reviewed === 'true' : undefined,
      });
    }

    return successResponse(res, mistakes, 'Mistakes retrieved successfully');
  } catch (error) {
    console.error('[MistakeController] getMistakes error:', error.message);
    return errorResponse(res, error.message, 500);
  }
};

export const markMistakeReviewed = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.firebaseUid || req.user?.uid;

    let updated = null;
    if (mongoose.connection.readyState === 1) {
      try {
        updated = await Mistake.findOneAndUpdate(
          { _id: id, userId },
          { $set: { reviewed: true } },
          { new: true }
        );
      } catch (e) {
        console.warn('[Mistakes] Mark reviewed notice:', e.message);
      }
    }

    if (!updated) {
      updated = markMistakeReviewedLocal(userId, id);
    }

    return successResponse(res, updated || { _id: id, reviewed: true }, 'Mistake marked as reviewed');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getMistakeStats = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid || 'guest';
    let total = 0;
    let categoryCounts = {};

    if (mongoose.connection.readyState === 1) {
      try {
        total = await Mistake.countDocuments({ userId });
        const group = await Mistake.aggregate([
          { $match: { userId } },
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        group.forEach(g => { categoryCounts[g._id] = g.count; });
      } catch (e) {
        // Fallback
      }
    }

    if (total === 0) {
      const userMistakes = mistakeStore.get(userId) || [];
      total = userMistakes.length;
      userMistakes.forEach((m) => {
        const cat = m.category || 'General';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    }

    return successResponse(res, {
      totalMistakes: total,
      breakdown: [
        { name: 'Grammar', count: categoryCounts['Grammar'] || 0, color: '#4F46E5' },
        { name: 'Vocabulary', count: categoryCounts['Vocabulary'] || 0, color: '#8B5CF6' },
        { name: 'Reading', count: categoryCounts['Reading'] || 0, color: '#3B82F6' },
        { name: 'Listening', count: categoryCounts['Listening'] || 0, color: '#EF4444' },
      ]
    }, 'Mistake statistics calculated');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
