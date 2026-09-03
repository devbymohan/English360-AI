import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import {
  getNotificationsLocal,
  markNotificationReadLocal,
  markAllNotificationsReadLocal,
} from '../utils/inMemoryStore.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid;
    if (!userId) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    let notifications = [];
    if (mongoose.connection.readyState === 1) {
      try {
        notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
      } catch (e) {
        console.warn('[NotificationController] DB fetch notice:', e.message);
      }
    }

    if (notifications.length === 0) {
      notifications = getNotificationsLocal(userId);
    }

    const unreadCount = notifications.filter((n) => !n.read).length;

    return successResponse(
      res,
      {
        notifications,
        unreadCount,
      },
      'Notifications retrieved successfully'
    );
  } catch (error) {
    console.error('[NotificationController] getNotifications error:', error.message);
    return errorResponse(res, error.message, 500);
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid;
    const { id } = req.params;

    if (!userId) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    markNotificationReadLocal(userId, id);

    if (mongoose.connection.readyState === 1) {
      try {
        await Notification.findOneAndUpdate({ _id: id, userId }, { $set: { read: true } });
      } catch (e) {
        console.warn('[NotificationController] DB update notice:', e.message);
      }
    }

    return successResponse(res, { id, read: true }, 'Notification marked as read');
  } catch (error) {
    console.error('[NotificationController] markAsRead error:', error.message);
    return errorResponse(res, error.message, 500);
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.firebaseUid || req.user?.uid;
    if (!userId) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    markAllNotificationsReadLocal(userId);

    if (mongoose.connection.readyState === 1) {
      try {
        await Notification.updateMany({ userId }, { $set: { read: true } });
      } catch (e) {
        console.warn('[NotificationController] DB update notice:', e.message);
      }
    }

    return successResponse(res, { readAll: true }, 'All notifications marked as read');
  } catch (error) {
    console.error('[NotificationController] markAllAsRead error:', error.message);
    return errorResponse(res, error.message, 500);
  }
};
