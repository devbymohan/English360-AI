import express from 'express';
import {
  getVocabularyWords,
  submitVocabularyQuiz,
  toggleBookmarkWord,
  getBookmarkedWords,
} from '../controllers/vocabularyController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', requireAuth, getVocabularyWords);
router.post('/submit-quiz', requireAuth, submitVocabularyQuiz);
router.post('/bookmark', requireAuth, toggleBookmarkWord);
router.get('/bookmarks', requireAuth, getBookmarkedWords);

export default router;
