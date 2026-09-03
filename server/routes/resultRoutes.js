import express from 'express';
import { getresultsData } from '../controllers/resultController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', requireAuth, getresultsData);

export default router;
