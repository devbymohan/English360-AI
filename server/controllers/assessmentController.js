import mongoose from 'mongoose';
import { generateAssessmentData } from '../services/geminiService.js';
import Assessment from '../models/Assessment.js';
import User from '../models/User.js';
import LearningActivity from '../models/LearningActivity.js';
import Notification from '../models/Notification.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { getOrCreateUser, addActivity, addNotificationLocal } from '../utils/inMemoryStore.js';

export const getAssessment = async (req, res) => {
  try {
    const { level = 'B1' } = req.body;
    const data = await generateAssessmentData(level);
    return successResponse(res, data, 'Diagnostic assessment generated successfully');
  } catch (error) {
    console.error('[AssessmentController] getAssessment error:', error.message);
    return errorResponse(res, `Failed to generate assessment: ${error.message}`, 500);
  }
};

export const submitAssessment = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid || 'guest';
    const {
      grammarScore = 80,
      vocabularyScore = 75,
      readingScore = 85,
      writingScore = 70,
      listeningScore = 80,
    } = req.body;

    const overallScore = Math.round((grammarScore + vocabularyScore + readingScore + writingScore + listeningScore) / 5);

    let estimatedLevel = 'B1';
    if (overallScore >= 90) estimatedLevel = 'C1';
    else if (overallScore >= 75) estimatedLevel = 'B2';
    else if (overallScore >= 60) estimatedLevel = 'B1';
    else if (overallScore >= 40) estimatedLevel = 'A2';
    else estimatedLevel = 'A1';

    // Update in-memory user & activity store
    const localUser = getOrCreateUser(userId);
    localUser.englishLevel = estimatedLevel;
    localUser.overallScore = overallScore;
    localUser.assessmentCompleted = true;

    addActivity(userId, {
      title: 'Initial English Assessment',
      type: 'assessment',
      score: `${overallScore}% (${estimatedLevel})`,
    });

    addNotificationLocal(userId, {
      title: 'Diagnostic Assessment Complete 🎉',
      message: `You scored ${overallScore}% and were placed at ${estimatedLevel} Level.`,
      type: 'assessment',
    });

    try {
      if (mongoose.connection.readyState === 1) {
        await Assessment.create({
          userId,
          level: estimatedLevel,
          grammarScore,
          vocabularyScore,
          readingScore,
          writingScore,
          listeningScore,
          overallScore,
        });

        await User.findOneAndUpdate(
          { firebaseUid: userId },
          {
            $set: {
              englishLevel: estimatedLevel,
              overallScore,
              assessmentCompleted: true,
            }
          },
          { new: true, upsert: true }
        );

        await LearningActivity.create({
          userId,
          title: 'Initial English Assessment',
          type: 'assessment',
          score: `${overallScore}% (${estimatedLevel})`,
        });

        await Notification.create({
          userId,
          title: 'Diagnostic Assessment Complete 🎉',
          message: `You scored ${overallScore}% and were placed at ${estimatedLevel} Level.`,
          type: 'assessment',
        });
      }
    } catch (e) {
      console.warn('[Assessment] Save notice:', e.message);
    }

    return successResponse(res, {
      estimatedLevel,
      overallScore,
      scores: {
        grammar: grammarScore,
        vocabulary: vocabularyScore,
        reading: readingScore,
        writing: writingScore,
        listening: listeningScore,
      },
      assessmentCompleted: true,
    }, 'Diagnostic assessment evaluated and recorded');
  } catch (error) {
    console.error('[AssessmentController] submitAssessment error:', error.message);
    return errorResponse(res, `Failed to submit assessment: ${error.message}`, 500);
  }
};
