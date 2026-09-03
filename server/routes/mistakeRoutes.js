import express from 'express';
import { getMistakes, markMistakeReviewed, getMistakeStats } from '../controllers/mistakeController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', requireAuth, getMistakes);
router.put('/:id/review', requireAuth, markMistakeReviewed);
router.get('/stats', requireAuth, getMistakeStats);

export default router;
