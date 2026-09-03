import mongoose from 'mongoose';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { userStore, getOrCreateUser } from '../utils/inMemoryStore.js';

/**
 * POST /api/users
 * Create or sync a MongoDB user using authenticated Firebase UID
 */
export const syncUser = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUid || req.user?.uid || req.body.firebaseUid;
    const email = req.body.email || req.user?.email;
    const name = req.body.name || req.user?.name || req.user?.displayName || 'Student';
    const photoURL = req.body.photoURL || req.user?.photoURL || '';
    const englishLevel = req.body.englishLevel || req.body.level || 'Not Assessed';

    if (!firebaseUid) {
      return errorResponse(res, 'Firebase UID is required to sync user profile.', 400);
    }

    // If MongoDB is connected, use real MongoDB collection
    if (mongoose.connection.readyState === 1) {
      let existingUser = await User.findOne({ firebaseUid });

      if (existingUser) {
        if (name && existingUser.name === 'Student' && name !== 'Student') {
          existingUser.name = name;
        }
        if (photoURL && !existingUser.photoURL) {
          existingUser.photoURL = photoURL;
        }
        await existingUser.save();
        return successResponse(res, existingUser, 'User profile retrieved successfully', 200);
      }

      const newUser = new User({
        firebaseUid,
        email: email || `${firebaseUid}@english360.ai`,
        name,
        photoURL,
        englishLevel,
        overallScore: 0,
        streak: 0,
        dailyGoal: 20,
        assessmentCompleted: false,
      });

      const savedUser = await newUser.save();
      return successResponse(res, savedUser, 'User profile created successfully in MongoDB', 201);
    }

    // Fallback: In-memory store when DB connection is pending
    if (userStore.has(firebaseUid)) {
      const existing = userStore.get(firebaseUid);
      if (name && name !== 'Student') existing.name = name;
      return successResponse(res, existing, 'User profile retrieved successfully (Local Store)', 200);
    }

    const mockProfile = {
      firebaseUid,
      email: email || `${firebaseUid}@english360.ai`,
      name,
      photoURL,
      englishLevel,
      overallScore: 0,
      streak: 0,
      dailyGoal: 20,
      assessmentCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    userStore.set(firebaseUid, mockProfile);
    return successResponse(res, mockProfile, 'User profile created successfully (Local Store)', 201);
  } catch (error) {
    console.error('[UserController] syncUser error:', error.message);
    return errorResponse(res, `Failed to sync user profile: ${error.message}`, 500);
  }
};

/**
 * GET /api/users/me
 * Return the authenticated user's MongoDB profile
 */
export const getMyProfile = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUid || req.user?.uid;

    if (!firebaseUid) {
      return errorResponse(res, 'Unauthenticated user.', 401);
    }

    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ firebaseUid });

      if (!user) {
        user = new User({
          firebaseUid,
          email: req.user?.email || `${firebaseUid}@english360.ai`,
          name: req.user?.name || req.user?.displayName || 'Student',
          photoURL: req.user?.photoURL || '',
          englishLevel: 'B1',
          overallScore: 0,
          streak: 0,
          dailyGoal: 20,
          assessmentCompleted: false,
        });
        await user.save();
      }

      return successResponse(res, user, 'Current user profile retrieved');
    }

    // Fallback
    const profile = inMemoryUsers.get(firebaseUid) || {
      firebaseUid,
      email: req.user?.email || `${firebaseUid}@english360.ai`,
      name: req.user?.name || req.user?.displayName || 'Student',
      photoURL: req.user?.photoURL || '',
      englishLevel: 'B1',
      overallScore: 0,
      streak: 0,
      dailyGoal: 20,
      assessmentCompleted: false,
    };

    return successResponse(res, profile, 'Current user profile retrieved (Local Store)');
  } catch (error) {
    console.error('[UserController] getMyProfile error:', error.message);
    return errorResponse(res, `Failed to retrieve user profile: ${error.message}`, 500);
  }
};

/**
 * PUT /api/users/me
 * Update safe profile fields
 */
export const updateMyProfile = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUid || req.user?.uid;

    if (!firebaseUid) {
      return errorResponse(res, 'Unauthenticated user.', 401);
    }

    const allowedUpdates = [
      'name',
      'photoURL',
      'englishLevel',
      'dailyGoal',
      'assessmentCompleted',
      'overallScore',
      'streak',
      'learningPreferences',
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (mongoose.connection.readyState === 1) {
      const updatedUser = await User.findOneAndUpdate(
        { firebaseUid },
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return errorResponse(res, 'User profile not found.', 404);
      }

      return successResponse(res, updatedUser, 'User profile updated successfully');
    }

    // Fallback
    const current = inMemoryUsers.get(firebaseUid) || { firebaseUid };
    const merged = { ...current, ...updates, updatedAt: new Date().toISOString() };
    inMemoryUsers.set(firebaseUid, merged);

    return successResponse(res, merged, 'User profile updated successfully (Local Store)');
  } catch (error) {
    console.error('[UserController] updateMyProfile error:', error.message);
    return errorResponse(res, `Failed to update profile: ${error.message}`, 500);
  }
};
