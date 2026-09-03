import express from 'express';
import {
  getGrammarLesson,
  submitGrammarExercise,
  getGrammarProgress,
  resetGrammarProgress,
} from '../controllers/grammarController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/generate', requireAuth, getGrammarLesson);
router.post('/submit', requireAuth, submitGrammarExercise);
router.get('/progress', requireAuth, getGrammarProgress);
router.post('/reset', requireAuth, resetGrammarProgress);

export default router;
