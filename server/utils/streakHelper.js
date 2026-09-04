import mongoose from 'mongoose';
import LearningActivity from '../models/LearningActivity.js';
import User from '../models/User.js';
import { getActivities, userStore } from './inMemoryStore.js';

// The 7 canonical meaningful learning activity types
export const MEANINGFUL_ACTIVITY_TYPES = new Set([
  'assessment',
  'grammar',
  'vocabulary',
  'reading',
  'writing',
  'listening',
  'test',
]);

/**
 * Format any date input to local calendar date string 'YYYY-MM-DD'
 * in the user's specific IANA timezone (e.g. 'Asia/Kolkata', 'America/New_York').
 */
export const getLocalDateString = (dateInput, timeZone = 'UTC') => {
  if (!dateInput) return null;
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(d);
  } catch (e) {
    return d.toISOString().split('T')[0];
  }
};

/**
 * Decrement one calendar day from 'YYYY-MM-DD' correctly across months and years.
 */
export const getPreviousDay = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().split('T')[0];
};

/**
 * Core streak calculation algorithm.
 *
 * Rules:
 * 1. Only meaningful activities count.
 * 2. Multiple activities on the same calendar day count as 1 streak day.
 * 3. Future-dated activities do not affect current streak.
 * 4. If an activity occurred TODAY in user's timezone:
 *    -> Streak count begins at today and counts consecutive prior days.
 * 5. If NO activity occurred today, but activity occurred YESTERDAY:
 *    -> Today has not ended yet. User has until 11:59:59 PM today.
 *    -> Streak is preserved from yesterday and counts consecutive prior days.
 * 6. If NO activity occurred today AND NO activity occurred yesterday:
 *    -> A full calendar day was completely missed.
 *    -> Streak resets to 0.
 */
export const calculateRealStreak = (activities = [], timeZone = 'UTC', referenceDate = new Date()) => {
  if (!Array.isArray(activities) || activities.length === 0) {
    return 0;
  }

  const currentDateStr = getLocalDateString(referenceDate, timeZone);
  if (!currentDateStr) return 0;

  const yesterdayStr = getPreviousDay(currentDateStr);

  // Collect unique local calendar days of meaningful activities on or before currentDateStr
  const activeDaysSet = new Set();
  activities.forEach((act) => {
    if (!act || !act.type || !MEANINGFUL_ACTIVITY_TYPES.has(act.type)) return;
    const actDate = act.createdAt || act.timestamp || act.date;
    const dateStr = getLocalDateString(actDate, timeZone);
    if (dateStr && dateStr <= currentDateStr) {
      activeDaysSet.add(dateStr);
    }
  });

  if (activeDaysSet.size === 0) {
    return 0;
  }

  let checkDate = null;
  if (activeDaysSet.has(currentDateStr)) {
    checkDate = currentDateStr;
  } else if (activeDaysSet.has(yesterdayStr)) {
    checkDate = yesterdayStr;
  } else {
    // Both today and yesterday had no activity -> Streak resets to 0
    return 0;
  }

  let streak = 0;
  while (checkDate && activeDaysSet.has(checkDate)) {
    streak++;
    checkDate = getPreviousDay(checkDate);
  }

  return streak;
};

/**
 * Retrieve all activities for a user, calculate the real streak,
 * and persist to MongoDB User model and in-memory userStore.
 */
export const calculateAndPersistUserStreak = async (userId, timeZone = 'UTC') => {
  if (!userId || userId === 'usr_guest_student') {
    return 0;
  }

  let activities = [];

  if (mongoose.connection.readyState === 1) {
    try {
      activities = await LearningActivity.find({ userId }).sort({ createdAt: -1 });
    } catch (err) {
      console.warn('[StreakHelper] DB activities fetch notice:', err.message);
    }
  }

  // If DB returned no activities or was offline, fallback to in-memory activities
  if (!activities || activities.length === 0) {
    activities = getActivities(userId);
  }

  const streak = calculateRealStreak(activities, timeZone);

  // Update in-memory user
  if (userStore.has(userId)) {
    userStore.get(userId).streak = streak;
  }

  // Update MongoDB User
  if (mongoose.connection.readyState === 1) {
    try {
      await User.updateOne({ firebaseUid: userId }, { $set: { streak } });
    } catch (err) {
      console.warn('[StreakHelper] User streak DB update notice:', err.message);
    }
  }

  return streak;
};
