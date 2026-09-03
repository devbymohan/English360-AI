import express from 'express';
import { getTest, submitTest, getTestResultById } from '../controllers/testController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/generate', requireAuth, getTest);
router.post('/submit', requireAuth, submitTest);
router.get('/results/:id', requireAuth, getTestResultById);

export default router;
