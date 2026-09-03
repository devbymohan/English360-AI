import express from 'express';
import { syncUser, getMyProfile, updateMyProfile } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// User synchronization & profile routes
router.post('/', requireAuth, syncUser);
router.get('/me', requireAuth, getMyProfile);
router.put('/me', requireAuth, updateMyProfile);

export default router;
