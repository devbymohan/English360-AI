import mongoose from 'mongoose';
import { generateReadingPassage } from '../services/geminiService.js';
import ReadingAttempt from '../models/ReadingAttempt.js';
import Mistake from '../models/Mistake.js';
import LearningActivity from '../models/LearningActivity.js';
import Notification from '../models/Notification.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import {
  addMistakes,
  addActivity,
  addNotificationLocal,
  addSeenReadingTopicLocal,
  getSeenReadingTopicsLocal,
} from '../utils/inMemoryStore.js';
import { calculateAndPersistUserStreak } from '../utils/streakHelper.js';

export const getReadingPassage = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid || 'guest';
    const {
      topic = null,
      level = 'B1',
      excludedTopics = [],
      sessionId = null,
      timestamp = Date.now(),
    } = req.body;

    const serverSeen = getSeenReadingTopicsLocal(userId);
    const combinedExcluded = Array.from(
      new Set([...(excludedTopics || []).map((t) => String(t).toLowerCase()), ...serverSeen])
    );

    const data = await generateReadingPassage(
      topic,
      level,
      combinedExcluded,
      sessionId,
      timestamp
    );

    if (data?.title || data?.topic) {
      addSeenReadingTopicLocal(userId, data.title || data.topic);
    }

    return successResponse(res, data, 'Reading passage generated successfully');
  } catch (error) {
    console.error('[ReadingController] getReadingPassage error:', error.message);
    return errorResponse(res, `Failed to generate reading passage: ${error.message}`, 500);
  }
};

export const submitReadingAttempt = async (req, res) => {
  try {
    const userId = (req.firebaseUid && req.firebaseUid !== 'usr_guest_student')
      ? req.firebaseUid
      : (req.body?.firebaseUid || req.body?.userId || req.headers?.['x-firebase-uid'] || req.user?.uid || 'usr_guest_student');
    const {
      passageId = 'passage_1',
      title = 'Reading Comprehension',
      wordCount = 300,
      readingTimeSeconds = 120,
      questions = [],
      answers = {},
    } = req.body;

    let correctCount = 0;
    const mistakeDocs = [];

    questions.forEach((q, idx) => {
      const userAns = answers[idx] !== undefined ? answers[idx] : answers[q.id];
      if (userAns === q.correctAnswer) {
        correctCount++;
      } else {
        mistakeDocs.push({
          userId,
          category: 'Reading',
          topic: title,
          question: q.prompt,
          userAnswer: userAns || 'No Answer',
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || 'Review the relevant section of the passage.',
          source: 'Reading Comprehension',
          reviewed: false,
        });
      }
    });

    const total = questions.length || 10;
    const wrongCount = total - correctCount;
    const accuracy = Math.round((correctCount / total) * 100);
    const readingTimeMinutes = Math.max(0.1, Number(readingTimeSeconds) / 60);
    const wpm = Math.round(Number(wordCount) / readingTimeMinutes);

    // Sync in-memory store
    if (mistakeDocs.length > 0) {
      addMistakes(userId, mistakeDocs);
    }

    addActivity(userId, {
      title: `Reading: ${title}`,
      type: 'reading',
      score: `${accuracy}%`,
    });

    addNotificationLocal(userId, {
      title: 'Reading Practice Complete',
      message: `Completed "${title}" with ${accuracy}% comprehension (${correctCount}/${total} correct, ${wpm} WPM).`,
      type: 'reading',
    });

    if (mongoose.connection.readyState === 1) {
      try {
        if (mistakeDocs.length > 0) {
          await Mistake.insertMany(mistakeDocs);
        }
        await ReadingAttempt.create({
          userId,
          passageId,
          wordCount,
          readingTime: readingTimeSeconds,
          wpm,
          comprehensionScore: accuracy,
          accuracy,
        });
        await LearningActivity.create({
          userId,
          title: `Reading: ${title}`,
          type: 'reading',
          score: `${accuracy}%`,
        });
        await Notification.create({
          userId,
          title: 'Reading Practice Complete',
          message: `Completed "${title}" with ${accuracy}% comprehension (${correctCount}/${total} correct, ${wpm} WPM).`,
          type: 'reading',
        });
      } catch (e) {
        console.warn('[Reading] DB save notice:', e.message);
      }
    }

    const timeZone = req.headers?.['x-timezone'] || req.body?.timezone || 'UTC';
    const streak = await calculateAndPersistUserStreak(userId, timeZone);

    return successResponse(
      res,
      {
        score: accuracy,
        accuracy,
        correctCount,
        wrongCount,
        total,
        wpm,
        readingTimeSeconds,
        mistakesCount: mistakeDocs.length,
        streak,
      },
      'Reading attempt recorded successfully'
    );
  } catch (error) {
    console.error('[ReadingController] submitReadingAttempt error:', error.message);
    return errorResponse(res, `Failed to submit reading attempt: ${error.message}`, 500);
  }
};
