import express from 'express';
import { getAssessment, submitAssessment, getMyAssessment } from '../controllers/assessmentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/generate', requireAuth, getAssessment);
router.post('/submit', requireAuth, submitAssessment);
router.get('/my', requireAuth, getMyAssessment);

export default router;
