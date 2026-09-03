import express from 'express';
import { chatWithCoach, getCoachRecommendations } from '../controllers/aiCoachController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/chat', requireAuth, chatWithCoach);
router.get('/recommendations', requireAuth, getCoachRecommendations);

export default router;
