import express from 'express';
import { getAchievements } from '../controllers/achievementController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', requireAuth, getAchievements);

export default router;
