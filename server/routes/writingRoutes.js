import express from 'express';
import { evaluateStudentWriting } from '../controllers/writingController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/evaluate', requireAuth, evaluateStudentWriting);

export default router;
