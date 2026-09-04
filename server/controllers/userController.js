import mongoose from 'mongoose';
import User from '../models/User.js';
import Assessment from '../models/Assessment.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { userStore, getOrCreateUser, assessmentStore } from '../utils/inMemoryStore.js';
import { calculateAndPersistUserStreak } from '../utils/streakHelper.js';

/**
 * POST /api/users
 * Create or sync a MongoDB user using authenticated Firebase UID
 */
export const syncUser = async (req, res) => {
  try {
    const timeZone = req.headers?.['x-timezone'] || req.query?.timezone || 'UTC';
    const firebaseUid = (req.firebaseUid && req.firebaseUid !== 'usr_guest_student')
      ? req.firebaseUid
      : (req.body?.firebaseUid || req.headers?.['x-firebase-uid'] || req.user?.uid);
    const email = req.body?.email || req.user?.email;
    const name = req.body?.name || req.user?.name || req.user?.displayName || 'Student';
    const photoURL = req.body?.photoURL || req.user?.photoURL || '';
    const incomingLevel = req.body.englishLevel || req.body.level || null;
    const incomingCompleted = req.body.assessmentCompleted === true;
    const incomingScore = typeof req.body.overallScore === 'number' ? req.body.overallScore : null;

    if (!firebaseUid) {
      return errorResponse(res, 'Firebase UID is required to sync user profile.', 400);
    }

    const calculatedStreak = await calculateAndPersistUserStreak(firebaseUid, timeZone);

    // If MongoDB is connected, use real MongoDB collection
    if (mongoose.connection.readyState === 1) {
      let existingUser = await User.findOne({ firebaseUid });
      const latestAssessment = await Assessment.findOne({ userId: firebaseUid }).sort({ createdAt: -1 });

      if (existingUser) {
        if (name && existingUser.name === 'Student' && name !== 'Student') {
          existingUser.name = name;
        }
        if (photoURL && !existingUser.photoURL) {
          existingUser.photoURL = photoURL;
        }

        // Automatic reconciliation: If assessment exists in DB or was completed, permanently preserve it!
        if (latestAssessment) {
          existingUser.assessmentCompleted = true;
          existingUser.englishLevel = latestAssessment.level;
          existingUser.overallScore = latestAssessment.overallScore || existingUser.overallScore;
        } else if (incomingCompleted && (!existingUser.assessmentCompleted || existingUser.englishLevel === 'Not Assessed')) {
          existingUser.assessmentCompleted = true;
          if (incomingLevel && incomingLevel !== 'Not Assessed') existingUser.englishLevel = incomingLevel;
          if (incomingScore !== null) existingUser.overallScore = incomingScore;
        }

        existingUser.streak = calculatedStreak;
        await existingUser.save();
        return successResponse(res, existingUser, 'User profile retrieved successfully', 200);
      }

      // New user creation in MongoDB
      const hasAssessment = Boolean(latestAssessment || incomingCompleted);
      const startingLevel = latestAssessment?.level || (incomingCompleted ? incomingLevel : null) || 'Not Assessed';
      const startingScore = latestAssessment?.overallScore || (incomingCompleted ? incomingScore : null) || 0;

      const newUser = new User({
        firebaseUid,
        email: email || `${firebaseUid}@english360.ai`,
        name,
        photoURL,
        englishLevel: startingLevel,
        overallScore: startingScore,
        streak: calculatedStreak,
        dailyGoal: 20,
        assessmentCompleted: hasAssessment,
      });

      const savedUser = await newUser.save();
      return successResponse(res, savedUser, 'User profile created successfully in MongoDB', 201);
    }

    // Fallback: In-memory store when DB connection is pending
    const storedAssessment = assessmentStore.get(firebaseUid);
    const hasStoredAssessment = Boolean(storedAssessment || incomingCompleted);
    const resolvedLevel = storedAssessment?.level || (incomingCompleted ? incomingLevel : null) || 'Not Assessed';
    const resolvedScore = storedAssessment?.overallScore || (incomingCompleted ? incomingScore : null) || 0;

    if (userStore.has(firebaseUid)) {
      const existing = userStore.get(firebaseUid);
      if (name && name !== 'Student') existing.name = name;
      if (photoURL && !existing.photoURL) existing.photoURL = photoURL;
      if (hasStoredAssessment && (!existing.assessmentCompleted || existing.englishLevel === 'Not Assessed')) {
        existing.assessmentCompleted = true;
        existing.englishLevel = resolvedLevel;
        existing.overallScore = resolvedScore;
      }
      existing.streak = calculatedStreak;
      return successResponse(res, existing, 'User profile retrieved successfully (Local Store)', 200);
    }

    const mockProfile = {
      firebaseUid,
      email: email || `${firebaseUid}@english360.ai`,
      name,
      photoURL,
      englishLevel: resolvedLevel,
      overallScore: resolvedScore,
      streak: calculatedStreak,
      dailyGoal: 20,
      assessmentCompleted: hasStoredAssessment,
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
    const timeZone = req.headers?.['x-timezone'] || req.query?.timezone || 'UTC';
    const firebaseUid = (req.firebaseUid && req.firebaseUid !== 'usr_guest_student')
      ? req.firebaseUid
      : (req.query?.firebaseUid || req.headers?.['x-firebase-uid'] || req.user?.uid);

    if (!firebaseUid) {
      return errorResponse(res, 'Unauthenticated user.', 401);
    }

    const calculatedStreak = await calculateAndPersistUserStreak(firebaseUid, timeZone);

    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ firebaseUid });
      const latestAssessment = await Assessment.findOne({ userId: firebaseUid }).sort({ createdAt: -1 });

      if (!user) {
        user = new User({
          firebaseUid,
          email: req.user?.email || `${firebaseUid}@english360.ai`,
          name: req.user?.name || req.user?.displayName || 'Student',
          photoURL: req.user?.photoURL || '',
          englishLevel: latestAssessment?.level || 'Not Assessed',
          overallScore: latestAssessment?.overallScore || 0,
          streak: calculatedStreak,
          dailyGoal: 20,
          assessmentCompleted: Boolean(latestAssessment),
        });
        await user.save();
      } else {
        if (latestAssessment && (!user.assessmentCompleted || user.englishLevel === 'Not Assessed')) {
          user.assessmentCompleted = true;
          user.englishLevel = latestAssessment.level;
          user.overallScore = latestAssessment.overallScore || user.overallScore;
        }
        user.streak = calculatedStreak;
        await user.save();
      }

      return successResponse(res, user, 'Current user profile retrieved');
    }

    // Fallback: In-memory store
    let profile = userStore.get(firebaseUid);
    const storedAssessment = assessmentStore.get(firebaseUid);

    if (!profile) {
      profile = {
        firebaseUid,
        email: req.user?.email || `${firebaseUid}@english360.ai`,
        name: req.user?.name || req.user?.displayName || 'Student',
        photoURL: req.user?.photoURL || '',
        englishLevel: storedAssessment?.level || 'Not Assessed',
        overallScore: storedAssessment?.overallScore || 0,
        streak: calculatedStreak,
        dailyGoal: 20,
        assessmentCompleted: Boolean(storedAssessment),
      };
      userStore.set(firebaseUid, profile);
    } else {
      if (storedAssessment && (!profile.assessmentCompleted || profile.englishLevel === 'Not Assessed')) {
        profile.assessmentCompleted = true;
        profile.englishLevel = storedAssessment.level;
        profile.overallScore = storedAssessment.overallScore || profile.overallScore;
      }
      profile.streak = calculatedStreak;
    }

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
