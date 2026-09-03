import mongoose from 'mongoose';
import { generateListeningContent } from '../services/geminiService.js';
import ListeningAttempt from '../models/ListeningAttempt.js';
import Mistake from '../models/Mistake.js';
import LearningActivity from '../models/LearningActivity.js';
import Notification from '../models/Notification.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import {
  addMistakes,
  addActivity,
  addNotificationLocal,
  addSeenListeningTopicLocal,
  getSeenListeningTopicsLocal,
} from '../utils/inMemoryStore.js';

export const getListeningLesson = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid || 'guest';
    const {
      topic = null,
      level = 'B1',
      excludedLessons = [],
      sessionId = null,
      timestamp = Date.now(),
    } = req.body;

    const seenTopics = getSeenListeningTopicsLocal(userId);
    const combinedExcluded = Array.from(new Set([...excludedLessons, ...seenTopics]));

    const lesson = await generateListeningContent(
      topic,
      level,
      combinedExcluded,
      sessionId,
      timestamp
    );

    if (lesson?.topic || lesson?.title) {
      addSeenListeningTopicLocal(userId, lesson.topic || lesson.title);
    }

    return successResponse(res, lesson, 'Listening lesson generated successfully');
  } catch (error) {
    console.error('[ListeningController] getListeningLesson error:', error.message);
    return errorResponse(res, `Failed to generate listening lesson: ${error.message}`, 500);
  }
};

export const submitListeningAttempt = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid || 'guest';
    const {
      lessonId = 'listening_1',
      title = 'Listening Lesson',
      questions = [],
      answers = {},
      timeTaken = '01:30',
    } = req.body;

    let correctCount = 0;
    const mistakeDocs = [];

    questions.forEach((q, idx) => {
      const userAns = answers[idx] !== undefined ? answers[idx] : answers[q.id];
      if (userAns === q.correctAnswer) {
        correctCount++;
      } else if (userAns) {
        mistakeDocs.push({
          userId,
          category: 'Listening',
          topic: title,
          question: q.prompt,
          userAnswer: userAns,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || 'Listen carefully to key dialogue facts.',
          source: 'Listening Practice',
          reviewed: false,
        });
      }
    });

    const total = questions.length || 1;
    const score = Math.round((correctCount / total) * 100);

    // Sync in-memory store
    if (mistakeDocs.length > 0) {
      addMistakes(userId, mistakeDocs);
    }
    addActivity(userId, {
      title: `Listening: ${title}`,
      type: 'listening',
      score: `${score}%`,
    });

    addNotificationLocal(userId, {
      title: 'Listening Exercise Complete',
      message: `Completed "${title}" with score ${score}% (${correctCount}/${total}).`,
      type: 'listening',
    });

    if (mistakeDocs.length > 0) {
      try {
        if (mongoose.connection.readyState === 1) {
          await Mistake.insertMany(mistakeDocs);
        }
      } catch (e) {
        console.warn('[Listening] Mistake save notice:', e.message);
      }
    }

    try {
      if (mongoose.connection.readyState === 1) {
        await ListeningAttempt.create({
          userId,
          lessonId,
          score,
          correctAnswers: correctCount,
          totalQuestions: total,
          timeTaken,
        });
        await LearningActivity.create({
          userId,
          title: `Listening: ${title}`,
          type: 'listening',
          score: `${score}%`,
        });
        await Notification.create({
          userId,
          title: 'Listening Exercise Complete',
          message: `Completed "${title}" with score ${score}% (${correctCount}/${total}).`,
          type: 'listening',
        });
      }
    } catch (e) {
      console.warn('[Listening] Attempt save notice:', e.message);
    }

    return successResponse(
      res,
      {
        score,
        correctCount,
        total,
        accuracy: score,
        mistakesCount: mistakeDocs.length,
      },
      'Listening attempt recorded successfully'
    );
  } catch (error) {
    console.error('[ListeningController] submitListeningAttempt error:', error.message);
    return errorResponse(res, `Failed to submit listening attempt: ${error.message}`, 500);
  }
};
