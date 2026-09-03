/**
 * Resilient In-Memory Storage Cache
 * Scoped strictly by Firebase UID for 100% user data isolation
 * Active when MongoDB connection is establishing or offline
 */

export const userStore = new Map();
export const activityStore = new Map(); // userId -> Array of activities
export const mistakeStore = new Map(); // userId -> Array of mistakes
export const assessmentStore = new Map(); // userId -> Assessment
export const grammarStore = new Map(); // userId -> Array of grammar progress
export const testResultStore = new Map(); // userId -> Array of test results

export const getOrCreateUser = (userId, defaults = {}) => {
  if (!userStore.has(userId)) {
    userStore.set(userId, {
      firebaseUid: userId,
      name: defaults.name || 'Student',
      email: defaults.email || `${userId}@english360.ai`,
      englishLevel: defaults.englishLevel || 'Not Assessed',
      overallScore: defaults.overallScore || 0,
      streak: defaults.streak || 0,
      assessmentCompleted: defaults.assessmentCompleted || false,
      dailyGoal: 20,
      createdAt: new Date().toISOString(),
    });
  }
  return userStore.get(userId);
};

export const addActivity = (userId, activity) => {
  if (!activityStore.has(userId)) {
    activityStore.set(userId, []);
  }
  const list = activityStore.get(userId);
  list.unshift({
    ...activity,
    userId,
    createdAt: new Date().toISOString(),
  });
};

export const getActivities = (userId) => {
  return activityStore.get(userId) || [];
};

export const addMistakes = (userId, mistakes = []) => {
  if (!mistakeStore.has(userId)) {
    mistakeStore.set(userId, []);
  }
  const list = mistakeStore.get(userId);
  mistakes.forEach((m) => {
    list.unshift({
      _id: 'mst_' + Date.now() + Math.random().toString(36).substr(2, 4),
      userId,
      ...m,
      reviewed: false,
      createdAt: new Date().toISOString(),
    });
  });
};

export const getMistakesForUser = (userId, query = {}) => {
  const list = mistakeStore.get(userId) || [];
  return list.filter((m) => {
    if (query.category && query.category !== 'All' && m.category !== query.category) return false;
    if (query.reviewed !== undefined && m.reviewed !== query.reviewed) return false;
    if (query.search) {
      const s = query.search.toLowerCase();
      return (
        (m.question || '').toLowerCase().includes(s) ||
        (m.topic || '').toLowerCase().includes(s) ||
        (m.explanation || '').toLowerCase().includes(s)
      );
    }
    return true;
  });
};

export const markMistakeReviewedLocal = (userId, mistakeId) => {
  const list = mistakeStore.get(userId) || [];
  const item = list.find((m) => m._id === mistakeId);
  if (item) {
    item.reviewed = true;
    return item;
  }
  return null;
};

export const addGrammarProgressLocal = (userId, topicId, score, attempts = []) => {
  if (!grammarStore.has(userId)) {
    grammarStore.set(userId, []);
  }
  const list = grammarStore.get(userId);
  let existing = list.find((g) => g.topicId === topicId);
  if (!existing) {
    existing = {
      topicId,
      completed: false,
      score: 0,
      attempts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(existing);
  }

  existing.completed = true;
  existing.score = score;
  existing.attempts = Array.isArray(attempts) ? [...attempts] : [];
  existing.updatedAt = new Date().toISOString();
};

export const getGrammarProgressLocal = (userId) => {
  return grammarStore.get(userId) || [];
};

export const resetGrammarProgressLocal = (userId) => {
  if (grammarStore.has(userId)) {
    const list = grammarStore.get(userId);
    list.forEach((g) => {
      g.completed = false;
      g.score = 0;
      g.attempts = [];
      g.updatedAt = new Date().toISOString();
    });
  }
};

export const notificationStore = new Map(); // userId -> Array of notifications

export const addNotificationLocal = (userId, notification) => {
  if (!notificationStore.has(userId)) {
    notificationStore.set(userId, []);
  }
  const list = notificationStore.get(userId);
  const newNotif = {
    _id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    userId,
    title: notification.title || 'Notification',
    message: notification.message || '',
    type: notification.type || 'system',
    read: Boolean(notification.read),
    link: notification.link || '',
    createdAt: new Date().toISOString(),
  };
  list.unshift(newNotif);
  return newNotif;
};

export const getNotificationsLocal = (userId) => {
  return notificationStore.get(userId) || [];
};

export const markNotificationReadLocal = (userId, notificationId) => {
  const list = notificationStore.get(userId) || [];
  const found = list.find((n) => n._id === notificationId);
  if (found) {
    found.read = true;
    return found;
  }
  return null;
};

export const markAllNotificationsReadLocal = (userId) => {
  const list = notificationStore.get(userId) || [];
  list.forEach((n) => {
    n.read = true;
  });
  return list;
};

export const vocabHistoryStore = new Map(); // userId -> Set of seen words
export const vocabBookmarkStore = new Map(); // userId -> Array of bookmarked word objects

export const addSeenVocabWordsLocal = (userId, words = []) => {
  if (!vocabHistoryStore.has(userId)) {
    vocabHistoryStore.set(userId, new Set());
  }
  const set = vocabHistoryStore.get(userId);
  words.forEach((w) => set.add(typeof w === 'string' ? w.toLowerCase() : w.word?.toLowerCase()));
};

export const getSeenVocabWordsLocal = (userId) => {
  const set = vocabHistoryStore.get(userId);
  return set ? Array.from(set) : [];
};

export const toggleVocabBookmarkLocal = (userId, wordObj) => {
  if (!vocabBookmarkStore.has(userId)) {
    vocabBookmarkStore.set(userId, []);
  }
  const list = vocabBookmarkStore.get(userId);
  const idx = list.findIndex((w) => w.word.toLowerCase() === wordObj.word.toLowerCase());
  if (idx >= 0) {
    list.splice(idx, 1);
    return { bookmarked: false, word: wordObj.word };
  } else {
    list.push({ ...wordObj, bookmarked: true });
    return { bookmarked: true, word: wordObj.word };
  }
};

export const getVocabBookmarksLocal = (userId) => {
  return vocabBookmarkStore.get(userId) || [];
};

export const readingHistoryStore = new Map(); // userId -> Set of seen topics/titles

export const addSeenReadingTopicLocal = (userId, topicOrTitle) => {
  if (!topicOrTitle) return;
  if (!readingHistoryStore.has(userId)) {
    readingHistoryStore.set(userId, new Set());
  }
  const set = readingHistoryStore.get(userId);
  set.add(String(topicOrTitle).toLowerCase().trim());
};

export const getSeenReadingTopicsLocal = (userId) => {
  const set = readingHistoryStore.get(userId);
  return set ? Array.from(set) : [];
};

export const listeningHistoryStore = new Map(); // userId -> Set of seen topics/titles

export const addSeenListeningTopicLocal = (userId, topicOrTitle) => {
  if (!topicOrTitle) return;
  if (!listeningHistoryStore.has(userId)) {
    listeningHistoryStore.set(userId, new Set());
  }
  const set = listeningHistoryStore.get(userId);
  set.add(String(topicOrTitle).toLowerCase().trim());
};

export const getSeenListeningTopicsLocal = (userId) => {
  const set = listeningHistoryStore.get(userId);
  return set ? Array.from(set) : [];
};
