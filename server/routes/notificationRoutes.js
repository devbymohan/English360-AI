import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', requireAuth, getNotifications);
router.put('/read-all', requireAuth, markAllAsRead);
router.put('/:id/read', requireAuth, markAsRead);

export default router;
