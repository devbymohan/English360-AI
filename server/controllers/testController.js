import mongoose from 'mongoose';
import { generateTestQuestions } from '../services/geminiService.js';
import TestResult from '../models/TestResult.js';
import Mistake from '../models/Mistake.js';
import LearningActivity from '../models/LearningActivity.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { addMistakes, addActivity } from '../utils/inMemoryStore.js';
import { calculateAndPersistUserStreak } from '../utils/streakHelper.js';

export const getTest = async (req, res) => {
  try {
    const { category = 'Mixed', level = 'B1', count = 10, difficulty = 'Medium' } = req.body;
    const test = await generateTestQuestions(category, level, count, difficulty);
    return successResponse(res, test, 'Test generated successfully');
  } catch (error) {
    console.error('[TestController] getTest error:', error.message);
    return errorResponse(res, `Failed to generate test: ${error.message}`, 500);
  }
};

export const submitTest = async (req, res) => {
  try {
    const userId = (req.firebaseUid && req.firebaseUid !== 'usr_guest_student')
      ? req.firebaseUid
      : (req.body?.firebaseUid || req.body?.userId || req.headers?.['x-firebase-uid'] || req.user?.uid || 'usr_guest_student');
    const {
      testId = 'test_1',
      title = 'Comprehensive English Test',
      questions = [],
      answers = [],
      timeTaken = '14:20',
    } = req.body;

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let skippedAnswers = 0;
    const mistakeDocs = [];
    const sectionStats = {};

    questions.forEach((q, idx) => {
      const userAns = answers[idx] || answers[q.id];
      const cat = q.category || 'General';
      if (!sectionStats[cat]) sectionStats[cat] = { correct: 0, total: 0 };
      sectionStats[cat].total++;

      if (!userAns) {
        skippedAnswers++;
      } else if (userAns === q.correctAnswer) {
        correctAnswers++;
        sectionStats[cat].correct++;
      } else {
        incorrectAnswers++;
        mistakeDocs.push({
          userId,
          category: cat,
          topic: title,
          question: q.prompt,
          userAnswer: userAns,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || 'Review question details.',
          source: title,
          reviewed: false,
        });
      }
    });

    const total = questions.length || 1;
    const score = Math.round((correctAnswers / total) * 100);

    // Sync in-memory store
    if (mistakeDocs.length > 0) {
      addMistakes(userId, mistakeDocs);
    }
    addActivity(userId, {
      title,
      type: 'test',
      score: `${score}%`,
    });

    if (mistakeDocs.length > 0) {
      try {
        if (mongoose.connection.readyState === 1) {
          await Mistake.insertMany(mistakeDocs);
        }
      } catch (e) {
        console.warn('[Test] Mistake save notice:', e.message);
      }
    }

    let savedResult = null;
    try {
      if (mongoose.connection.readyState === 1) {
        savedResult = await TestResult.create({
          userId,
          testId,
          score,
          correctAnswers,
          incorrectAnswers,
          skippedAnswers,
          accuracy: score,
          timeTaken,
          sectionScores: sectionStats,
        });

        await LearningActivity.create({
          userId,
          title,
          type: 'test',
          score: `${score}%`,
        });
      }
    } catch (e) {
      console.warn('[Test] TestResult save notice:', e.message);
    }

    const timeZone = req.headers?.['x-timezone'] || req.body?.timezone || 'UTC';
    const streak = await calculateAndPersistUserStreak(userId, timeZone);

    return successResponse(res, {
      id: savedResult?._id || testId,
      score,
      correctAnswers,
      incorrectAnswers,
      skippedAnswers,
      accuracy: score,
      timeTaken,
      sectionScores: sectionStats,
      streak,
    }, 'Test evaluated and saved successfully');
  } catch (error) {
    console.error('[TestController] submitTest error:', error.message);
    return errorResponse(res, `Failed to submit test: ${error.message}`, 500);
  }
};

export const getTestResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await TestResult.findById(id);
    if (!result) {
      return successResponse(res, null, 'Test result not found', 200);
    }
    return successResponse(res, result, 'Test result retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
