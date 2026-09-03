import express from 'express';
import { getListeningLesson, submitListeningAttempt } from '../controllers/listeningController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/generate', requireAuth, getListeningLesson);
router.post('/submit', requireAuth, submitListeningAttempt);

export default router;
