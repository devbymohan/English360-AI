import express from 'express';
import { getStudentProgress, getDashboardSummary } from '../controllers/progressController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', requireAuth, getStudentProgress);
router.get('/dashboard', requireAuth, getDashboardSummary);

export default router;
