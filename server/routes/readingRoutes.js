import express from 'express';
import { getReadingPassage, submitReadingAttempt } from '../controllers/readingController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/generate', requireAuth, getReadingPassage);
router.post('/submit', requireAuth, submitReadingAttempt);

export default router;
