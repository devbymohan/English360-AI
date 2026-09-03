import mongoose from 'mongoose';
import { evaluateWriting } from '../services/geminiService.js';
import WritingSubmission from '../models/WritingSubmission.js';
import LearningActivity from '../models/LearningActivity.js';
import Notification from '../models/Notification.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { addActivity, addNotificationLocal } from '../utils/inMemoryStore.js';

export const evaluateStudentWriting = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid || 'guest';
    const { topic = 'The Impact of Technology on Students', content = '', level = 'B1' } = req.body;

    if (!content.trim()) {
      return errorResponse(res, 'Writing content cannot be empty.', 400);
    }

    const evaluation = await evaluateWriting(topic, content, level);
    const score = evaluation.overallScore !== undefined ? evaluation.overallScore : 0;
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    // Sync in-memory store
    addActivity(userId, {
      title: `Writing: ${topic}`,
      type: 'writing',
      score: `${score}%`,
    });

    addNotificationLocal(userId, {
      title: 'Writing Evaluation Complete',
      message: `Evaluated submission for "${topic}" (${wordCount} words): Score ${score}/100.`,
      type: 'writing',
    });

    if (mongoose.connection.readyState === 1) {
      try {
        await WritingSubmission.create({
          userId,
          topic,
          content,
          wordCount,
          score,
          grammarScore: evaluation.scores?.grammarAndAccuracy || 0,
          vocabularyScore: evaluation.scores?.lexicalResource || 0,
          clarityScore: evaluation.scores?.coherenceAndCohesion || 0,
          feedback: evaluation.feedback || {},
        });

        await LearningActivity.create({
          userId,
          title: `Writing: ${topic}`,
          type: 'writing',
          score: `${score}%`,
        });

        await Notification.create({
          userId,
          title: 'Writing Evaluation Complete',
          message: `Evaluated submission for "${topic}" (${wordCount} words): Score ${score}/100.`,
          type: 'writing',
        });
      } catch (e) {
        console.warn('[Writing] Submission save notice:', e.message);
      }
    }

    return successResponse(res, evaluation, 'Writing evaluated successfully by AI');
  } catch (error) {
    console.error('[WritingController] evaluateStudentWriting error:', error.message);
    return errorResponse(res, `Failed to evaluate writing: ${error.message}`, 500);
  }
};
