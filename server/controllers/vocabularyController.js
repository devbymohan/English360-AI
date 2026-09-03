import mongoose from 'mongoose';
import { generateVocabularyContent } from '../services/geminiService.js';
import VocabularyProgress from '../models/VocabularyProgress.js';
import Mistake from '../models/Mistake.js';
import LearningActivity from '../models/LearningActivity.js';
import Notification from '../models/Notification.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import {
  addActivity,
  addMistakes,
  addNotificationLocal,
  addSeenVocabWordsLocal,
  getSeenVocabWordsLocal,
  toggleVocabBookmarkLocal,
  getVocabBookmarksLocal,
} from '../utils/inMemoryStore.js';

export const getVocabularyWords = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid || 'guest';
    const {
      level = 'B1',
      count = 5,
      excludedWords = [],
      sessionId = null,
      timestamp = Date.now(),
    } = req.body;

    // Combine user's client-provided exclusions with server history
    const serverSeen = getSeenVocabWordsLocal(userId);
    const combinedExcluded = Array.from(
      new Set([...(excludedWords || []).map((w) => String(w).toLowerCase()), ...serverSeen])
    );

    const targetCount = Number(count) || 5;
    const vocab = await generateVocabularyContent(
      level,
      targetCount,
      combinedExcluded,
      sessionId,
      timestamp
    );

    // Track newly shown words for this user
    if (vocab?.words && Array.isArray(vocab.words)) {
      addSeenVocabWordsLocal(userId, vocab.words);
    }

    // Check bookmarks for user
    const bookmarks = getVocabBookmarksLocal(userId);
    const bookmarkedSet = new Set(bookmarks.map((b) => b.word.toLowerCase()));

    const enrichedWords = (vocab?.words || []).map((w) => ({
      ...w,
      bookmarked: bookmarkedSet.has(w.word.toLowerCase()),
    }));

    return successResponse(
      res,
      {
        level: vocab.level || level,
        words: enrichedWords,
      },
      'Vocabulary words generated successfully'
    );
  } catch (error) {
    console.error('[VocabularyController] getVocabularyWords error:', error.message);
    return errorResponse(res, `Failed to generate vocabulary: ${error.message}`, 500);
  }
};

export const submitVocabularyQuiz = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid || 'guest';
    const { words = [], answers = {} } = req.body;

    if (!Array.isArray(words) || words.length === 0) {
      return errorResponse(res, 'Words array is required to evaluate quiz.', 400);
    }

    let correctCount = 0;
    const mistakeDocs = [];

    words.forEach((w, idx) => {
      const userAns = answers[idx] !== undefined ? answers[idx] : answers[w.id];
      const correctAns = w.practiceQuestion?.correctAnswer || 'A';

      if (userAns === correctAns) {
        correctCount++;
      } else {
        mistakeDocs.push({
          userId,
          category: 'Vocabulary',
          topic: w.word,
          question: w.practiceQuestion?.prompt || `Meaning or usage of "${w.word}"`,
          userAnswer: userAns || 'No Answer',
          correctAnswer: correctAns,
          explanation:
            w.practiceQuestion?.explanation ||
            `"${w.word}": ${w.meaning} (Example: "${w.example}")`,
          source: 'Vocabulary Quick Quiz',
          reviewed: false,
        });
      }
    });

    const total = words.length;
    const wrongCount = total - correctCount;
    const score = Math.round((correctCount / total) * 100);

    // Save mistakes to local store
    if (mistakeDocs.length > 0) {
      addMistakes(userId, mistakeDocs);
    }

    // Add activity & notification
    addActivity(userId, {
      title: 'Daily Vocabulary Practice',
      type: 'vocabulary',
      score: `${score}%`,
    });

    addNotificationLocal(userId, {
      title: 'Vocabulary Practice Complete',
      message: `Completed 5 words quiz with ${score}% accuracy (${correctCount}/${total} correct).`,
      type: 'vocabulary',
    });

    // Save to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        if (mistakeDocs.length > 0) {
          await Mistake.insertMany(mistakeDocs);
        }
        await LearningActivity.create({
          userId,
          title: 'Daily Vocabulary Practice',
          type: 'vocabulary',
          score: `${score}%`,
        });
        await Notification.create({
          userId,
          title: 'Vocabulary Practice Complete',
          message: `Completed 5 words quiz with ${score}% accuracy (${correctCount}/${total} correct).`,
          type: 'vocabulary',
        });
      } catch (e) {
        console.warn('[Vocabulary] DB save notice:', e.message);
      }
    }

    return successResponse(
      res,
      {
        score,
        correctCount,
        wrongCount,
        total,
        mistakesCount: mistakeDocs.length,
      },
      'Vocabulary quiz submitted successfully'
    );
  } catch (error) {
    console.error('[VocabularyController] submitVocabularyQuiz error:', error.message);
    return errorResponse(res, `Failed to submit vocabulary quiz: ${error.message}`, 500);
  }
};

export const toggleBookmarkWord = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid || 'guest';
    const { word } = req.body;

    if (!word || !word.word) {
      return errorResponse(res, 'Word object is required.', 400);
    }

    const localResult = toggleVocabBookmarkLocal(userId, word);

    if (mongoose.connection.readyState === 1) {
      try {
        const existing = await VocabularyProgress.findOne({
          userId,
          word: word.word,
        });
        if (existing) {
          existing.bookmarked = localResult.bookmarked;
          await existing.save();
        } else {
          await VocabularyProgress.create({
            userId,
            wordId: String(word.id || Date.now()),
            word: word.word,
            bookmarked: localResult.bookmarked,
          });
        }
      } catch (e) {
        console.warn('[Vocabulary] Bookmark DB save notice:', e.message);
      }
    }

    return successResponse(res, localResult, 'Bookmark toggled successfully');
  } catch (error) {
    console.error('[VocabularyController] toggleBookmarkWord error:', error.message);
    return errorResponse(res, `Failed to toggle bookmark: ${error.message}`, 500);
  }
};

export const getBookmarkedWords = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid || 'guest';
    let bookmarks = [];

    if (mongoose.connection.readyState === 1) {
      try {
        bookmarks = await VocabularyProgress.find({ userId, bookmarked: true });
      } catch (e) {
        console.warn('[Vocabulary] DB fetch notice:', e.message);
      }
    }

    if (bookmarks.length === 0) {
      bookmarks = getVocabBookmarksLocal(userId);
    }

    return successResponse(res, { bookmarks }, 'Bookmarked words retrieved successfully');
  } catch (error) {
    console.error('[VocabularyController] getBookmarkedWords error:', error.message);
    return errorResponse(res, `Failed to fetch bookmarks: ${error.message}`, 500);
  }
};
