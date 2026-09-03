import mongoose from 'mongoose';
import { generateGrammarQuestions } from '../services/geminiService.js';
import GrammarProgress from '../models/GrammarProgress.js';
import Mistake from '../models/Mistake.js';
import LearningActivity from '../models/LearningActivity.js';
import Notification from '../models/Notification.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import {
  addMistakes,
  addActivity,
  addGrammarProgressLocal,
  getGrammarProgressLocal,
  resetGrammarProgressLocal,
  addNotificationLocal,
} from '../utils/inMemoryStore.js';

const CANONICAL_GRAMMAR_TOPICS = [
  'Present Simple',
  'Present Continuous',
  'Present Perfect',
  'Past Simple & Continuous',
  'Future Forms & Modals',
  'Conditionals (0, 1, 2, 3)',
  'Passive Voice & Reported Speech',
];

const normalizeTopic = (t = '') => {
  const norm = String(t).trim().toLowerCase().replace(/\s+/g, '');
  for (const topic of CANONICAL_GRAMMAR_TOPICS) {
    if (topic.toLowerCase().replace(/\s+/g, '') === norm) {
      return topic;
    }
  }
  return t;
};

// Helper to compute overall metrics and topic-wise breakdown
const computeGrammarStats = (records = []) => {
  let allAttempts = [];
  const completedTopicsSet = new Set();

  records.forEach((rec) => {
    const normTopic = normalizeTopic(rec.topicId || rec.topic);
    if (rec.completed) {
      completedTopicsSet.add(normTopic);
    }
    if (Array.isArray(rec.attempts)) {
      rec.attempts.forEach((att) => {
        allAttempts.push({
          ...att,
          topic: normTopic,
        });
      });
    }
  });

  // Calculate overall performance across all topics
  const totalQuestions = allAttempts.length;
  const correctAnswers = allAttempts.filter((a) => a.isCorrect === true).length;
  const wrongAnswers = allAttempts.filter((a) => a.isCorrect === false).length;
  const overallAccuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // Calculate topic-wise breakdown for all 7 topics
  const topicBreakdown = CANONICAL_GRAMMAR_TOPICS.map((topicName) => {
    const topicAttempts = allAttempts.filter((a) => a.topic === topicName);
    const attempted = topicAttempts.length;
    const correct = topicAttempts.filter((a) => a.isCorrect === true).length;
    const wrong = topicAttempts.filter((a) => a.isCorrect === false).length;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const completed = completedTopicsSet.has(topicName);

    return {
      topic: topicName,
      attempted,
      correct,
      wrong,
      accuracy,
      completed,
    };
  });

  return {
    overallPerformance: {
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      overallAccuracy,
    },
    topicBreakdown,
    completedTopics: Array.from(completedTopicsSet),
  };
};

export const getGrammarLesson = async (req, res) => {
  try {
    const { topic = 'Present Simple', level = 'B1', count = 5, sessionId, timestamp } = req.body;
    const lesson = await generateGrammarQuestions(topic, level, count, sessionId, timestamp);
    return successResponse(res, lesson, 'Grammar lesson generated successfully');
  } catch (error) {
    console.error('[GrammarController] getGrammarLesson error:', error.message);
    return errorResponse(res, `Failed to generate grammar lesson: ${error.message}`, 500);
  }
};

export const submitGrammarExercise = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid || 'guest';
    const {
      topic = 'Present Simple',
      level = 'B1',
      answers = {},
      questions = [],
      sessionId = null,
    } = req.body;

    const canonicalTopic = normalizeTopic(topic);
    const activeSessionId = sessionId || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    let correctCount = 0;
    let wrongCount = 0;
    const mistakeDocs = [];
    const newQuestionAttempts = [];

    questions.forEach((q, idx) => {
      const qId = String(q.id || `q_${idx + 1}`);
      const studentAns =
        answers[idx] !== undefined ? answers[idx] : answers[q.id] || answers[qId] || '';

      // Only count questions the student actually attempted with an answer
      if (studentAns) {
        const normalizedStudent = String(studentAns).trim().toUpperCase();
        const normalizedCorrect = String(q.correctAnswer).trim().toUpperCase();
        const isCorrect = normalizedStudent === normalizedCorrect;

        if (isCorrect) {
          correctCount++;
        } else {
          wrongCount++;
          mistakeDocs.push({
            userId,
            category: 'Grammar',
            topic: canonicalTopic,
            question: q.sentence || q.prompt,
            userAnswer: studentAns,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || 'Review grammar rules for this question.',
            source: 'Grammar Practice',
            reviewed: false,
          });
        }

        newQuestionAttempts.push({
          sessionId: activeSessionId,
          questionId: qId,
          question: q.sentence || q.prompt,
          selectedAnswer: studentAns,
          correctAnswer: q.correctAnswer,
          isCorrect,
          attemptedAt: new Date(),
        });
      }
    });

    const totalQuestions = questions.length || 5;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Save to local in-memory store (scoped by userId with deduplication)
    addGrammarProgressLocal(userId, canonicalTopic, score, newQuestionAttempts);
    if (mistakeDocs.length > 0) {
      addMistakes(userId, mistakeDocs);
    }
    addActivity(userId, {
      title: `${canonicalTopic} Practice`,
      type: 'grammar',
      score: `${score}%`,
    });
    addNotificationLocal(userId, {
      title: 'Grammar Practice Complete',
      message: `${canonicalTopic} exercise completed with ${score}% accuracy (${correctCount}/${totalQuestions} correct).`,
      type: 'grammar',
    });

    // Save to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        if (mistakeDocs.length > 0) {
          await Mistake.insertMany(mistakeDocs);
        }
        await LearningActivity.create({
          userId,
          title: `${canonicalTopic} Practice`,
          type: 'grammar',
          score: `${score}%`,
        });
        await Notification.create({
          userId,
          title: 'Grammar Practice Complete',
          message: `${canonicalTopic} exercise completed with ${score}% accuracy (${correctCount}/${totalQuestions} correct).`,
          type: 'grammar',
        });

        const existingProgress = await GrammarProgress.findOne({
          userId,
          topicId: canonicalTopic,
        });

        if (existingProgress) {
          existingProgress.completed = true;
          existingProgress.score = score;
          existingProgress.completedAt = new Date();
          existingProgress.attempts = newQuestionAttempts;
          existingProgress.totalAttempted = newQuestionAttempts.length;
          existingProgress.totalCorrect = correctCount;
          existingProgress.totalWrong = wrongCount;
          existingProgress.accuracy = score;

          await existingProgress.save();
        } else {
          await GrammarProgress.create({
            userId,
            topicId: canonicalTopic,
            completed: true,
            score,
            attempts: newQuestionAttempts,
            totalAttempted: newQuestionAttempts.length,
            totalCorrect: correctCount,
            totalWrong: wrongCount,
            accuracy: score,
          });
        }
      } catch (dbErr) {
        console.warn('[GrammarController] DB save notice:', dbErr.message);
      }
    }

    // Retrieve full student progress for calculation
    let allUserRecords = [];
    if (mongoose.connection.readyState === 1) {
      try {
        allUserRecords = await GrammarProgress.find({ userId }).lean();
      } catch (e) {
        allUserRecords = [];
      }
    }
    if (allUserRecords.length === 0) {
      allUserRecords = getGrammarProgressLocal(userId);
    }

    const { overallPerformance, topicBreakdown, completedTopics } = computeGrammarStats(allUserRecords);

    return successResponse(
      res,
      {
        score,
        correctCount,
        wrongCount,
        totalQuestions,
        accuracy: score,
        mistakesCount: mistakeDocs.length,
        topic: canonicalTopic,
        overallPerformance,
        topicBreakdown,
        completedTopics,
      },
      'Grammar exercise submitted successfully'
    );
  } catch (error) {
    console.error('[GrammarController] submitGrammarExercise error:', error.message);
    return errorResponse(res, `Failed to submit grammar exercise: ${error.message}`, 500);
  }
};

export const getGrammarProgress = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid;
    if (!userId) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    let allUserRecords = [];
    if (mongoose.connection.readyState === 1) {
      try {
        allUserRecords = await GrammarProgress.find({ userId }).lean();
      } catch (e) {
        console.warn('[GrammarController] DB progress fetch notice:', e.message);
      }
    }

    if (allUserRecords.length === 0) {
      allUserRecords = getGrammarProgressLocal(userId);
    }

    const { overallPerformance, topicBreakdown, completedTopics } = computeGrammarStats(allUserRecords);

    return successResponse(
      res,
      {
        completedTopics,
        totalCompleted: completedTopics.length,
        overallPerformance,
        topicBreakdown,
      },
      'Grammar progress retrieved successfully'
    );
  } catch (error) {
    console.error('[GrammarController] getGrammarProgress error:', error.message);
    return errorResponse(res, error.message, 500);
  }
};

export const resetGrammarProgress = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid || 'guest';

    // Clear completed flags and attempts in local in-memory store for this user
    resetGrammarProgressLocal(userId);

    // Clear completed flags and attempts in MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        await GrammarProgress.updateMany(
          { userId },
          {
            $set: {
              completed: false,
              score: 0,
              attempts: [],
              totalAttempted: 0,
              totalCorrect: 0,
              totalWrong: 0,
              accuracy: 0,
            },
          }
        );
      } catch (e) {
        console.warn('[GrammarController] DB reset notice:', e.message);
      }
    }

    const { overallPerformance, topicBreakdown, completedTopics } = computeGrammarStats([]);

    return successResponse(
      res,
      {
        completedTopics: [],
        totalCompleted: 0,
        overallPerformance,
        topicBreakdown,
      },
      'Grammar curriculum progression and stats reset successfully'
    );
  } catch (error) {
    console.error('[GrammarController] resetGrammarProgress error:', error.message);
    return errorResponse(res, error.message, 500);
  }
};
