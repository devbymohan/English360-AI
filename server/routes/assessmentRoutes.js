import express from 'express';
import { getAssessment, submitAssessment } from '../controllers/assessmentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/generate', requireAuth, getAssessment);
router.post('/submit', requireAuth, submitAssessment);

export default router;
