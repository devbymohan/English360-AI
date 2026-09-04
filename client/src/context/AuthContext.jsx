import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { getFriendlyAuthErrorMessage } from '../utils/authErrors';
import api from '../services/api';

// Scoped UID profile caching helpers to ensure zero-flash persistence across sessions
export const getCachedProfile = (uid) => {
  if (!uid || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`english360_user_profile_${uid}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setCachedProfile = (uid, profile) => {
  if (!uid || !profile || typeof window === 'undefined') return;
  try {
    const existing = getCachedProfile(uid) || {};
    const merged = { ...existing, ...profile };
    localStorage.setItem(`english360_user_profile_${uid}`, JSON.stringify(merged));
    localStorage.setItem('english360_user_uid', uid);
  } catch (e) {}
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedAssessment, setHasCompletedAssessmentState] = useState(false);

  const setHasCompletedAssessment = (completed) => {
    setHasCompletedAssessmentState(completed);
    if (user) {
      setUser((prev) => (prev ? { ...prev, assessmentCompleted: completed } : null));
      if (user.uid) {
        setCachedProfile(user.uid, { assessmentCompleted: completed });
      }
    }
  };

  // Helper to construct normalized student profile object from Firebase User
  const formatUserObject = (fbUser, mongoData = null) => {
    if (!fbUser) return null;
    const cached = getCachedProfile(fbUser.uid);
    const data = mongoData || cached;

    const name = data?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'Student';
    
    // Determine CEFR level (prefer non-'Not Assessed' value from mongo or cache)
    let level = 'Not Assessed';
    if (mongoData?.englishLevel && mongoData.englishLevel !== 'Not Assessed') {
      level = mongoData.englishLevel;
    } else if (cached?.englishLevel && cached.englishLevel !== 'Not Assessed') {
      level = cached.englishLevel;
    } else if (cached?.level && cached.level !== 'Not Assessed') {
      level = cached.level;
    } else if (mongoData?.level && mongoData.level !== 'Not Assessed') {
      level = mongoData.level;
    }

    const overallScore = mongoData?.overallScore ?? cached?.overallScore ?? 0;
    const streak = mongoData?.streak ?? cached?.streak ?? (level !== 'Not Assessed' ? 1 : 0);
    const assessmentCompleted = Boolean(
      mongoData?.assessmentCompleted ||
      cached?.assessmentCompleted ||
      (level !== 'Not Assessed')
    );

    return {
      uid: fbUser.uid,
      id: fbUser.uid,
      email: fbUser.email,
      name,
      displayName: name,
      photoURL: fbUser.photoURL || mongoData?.photoURL || cached?.photoURL || '',
      avatar: fbUser.photoURL || mongoData?.photoURL || cached?.photoURL || '',
      level,
      englishLevel: level,
      levelLabel: level === 'Not Assessed' ? 'Not Assessed' : `${level} Level`,
      overallScore,
      streak,
      points: mongoData?.points || cached?.points || 0,
      assessmentCompleted,
      isPremium: false,
    };
  };

  // Sync with MongoDB backend and update user profile state
  const syncWithBackend = async (fbUser) => {
    try {
      const cached = getCachedProfile(fbUser.uid);
      const response = await api.post('/users', {
        firebaseUid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Student',
        photoURL: fbUser.photoURL || '',
        englishLevel: cached?.englishLevel || cached?.level,
        assessmentCompleted: cached?.assessmentCompleted,
        overallScore: cached?.overallScore,
      });
      const mongoUser = response.data?.data;
      if (mongoUser) {
        setCachedProfile(fbUser.uid, mongoUser);
        const formatted = formatUserObject(fbUser, mongoUser);
        setHasCompletedAssessmentState(Boolean(formatted.assessmentCompleted));
        setUser(formatted);
        return mongoUser;
      }
    } catch (err) {
      console.warn('[AuthContext] Backend user sync notice:', err.message);
    }
    return null;
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/users/me');
      const mongoUser = res.data?.data;
      if (mongoUser && auth?.currentUser) {
        setCachedProfile(auth.currentUser.uid, mongoUser);
        const formatted = formatUserObject(auth.currentUser, mongoUser);
        setHasCompletedAssessmentState(Boolean(formatted.assessmentCompleted));
        setUser(formatted);
        return mongoUser;
      }
    } catch (e) {
      console.warn('[AuthContext] Profile refresh notice:', e.message);
    }
    return null;
  };

  const updateUserState = (partial = {}) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partial };
      if (partial.assessmentCompleted !== undefined) {
        setHasCompletedAssessmentState(Boolean(partial.assessmentCompleted));
      }
      if (prev.uid) {
        setCachedProfile(prev.uid, updated);
      }
      return updated;
    });
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        localStorage.setItem('english360_user_uid', firebaseUser.uid);
        // Instant setup with cached profile to avoid any flash of "Not Assessed"
        const initialUser = formatUserObject(firebaseUser);
        setUser(initialUser);
        if (initialUser?.assessmentCompleted) {
          setHasCompletedAssessmentState(true);
        }
        // Sync with MongoDB to retrieve/verify real level, score, assessment status
        await syncWithBackend(firebaseUser);
      } else {
        setUser(null);
        setHasCompletedAssessmentState(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. Register with Email & Password
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        const formatted = formatUserObject(userCredential.user);
        setUser(formatted);
        await syncWithBackend(userCredential.user);
        return { success: true, user: formatted };
      } else {
        // Fallback if Firebase not configured
        const fallbackUser = {
          uid: 'usr_' + Date.now(),
          id: 'usr_' + Date.now(),
          email,
          name: name || 'Student',
          displayName: name || 'Student',
          photoURL: '',
          avatar: '',
          level: 'Not Assessed',
          levelLabel: 'Not Assessed',
          overallScore: 0,
          streak: 0,
          points: 0,
          assessmentCompleted: false,
          isPremium: false,
        };
        setUser(fallbackUser);
        return { success: true, user: fallbackUser };
      }
    } catch (error) {
      const friendlyMessage = getFriendlyAuthErrorMessage(error);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  // 2. Login with Email & Password
  const login = async (email, password) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const formatted = formatUserObject(userCredential.user);
        setUser(formatted);
        const mongoUser = await syncWithBackend(userCredential.user);
        return { success: true, user: formatted, mongoUser };
      } else {
        const fallbackUser = {
          uid: 'usr_demo_01',
          id: 'usr_demo_01',
          email,
          name: email.split('@')[0] || 'Student',
          displayName: email.split('@')[0] || 'Student',
          photoURL: '',
          avatar: '',
          level: 'Not Assessed',
          levelLabel: 'Not Assessed',
          overallScore: 0,
          streak: 0,
          points: 0,
          assessmentCompleted: false,
          isPremium: false,
        };
        setUser(fallbackUser);
        return { success: true, user: fallbackUser };
      }
    } catch (error) {
      const friendlyMessage = getFriendlyAuthErrorMessage(error);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  // 3. Google Sign-In
  const googleLogin = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth && googleProvider) {
        const result = await signInWithPopup(auth, googleProvider);
        const formatted = formatUserObject(result.user);
        setUser(formatted);
        const mongoUser = await syncWithBackend(result.user);
        return { success: true, user: formatted, mongoUser };
      } else {
        const fallbackUser = {
          uid: 'usr_google_' + Date.now(),
          id: 'usr_google_' + Date.now(),
          email: 'student@example.com',
          name: 'Student',
          displayName: 'Student',
          photoURL: '',
          avatar: '',
          level: 'Not Assessed',
          levelLabel: 'Not Assessed',
          overallScore: 0,
          streak: 0,
          points: 0,
          assessmentCompleted: false,
          isPremium: false,
        };
        setUser(fallbackUser);
        return { success: true, user: fallbackUser };
      }
    } catch (error) {
      const friendlyMessage = getFriendlyAuthErrorMessage(error);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  // 4. Logout
  const logout = async () => {
    setLoading(true);
    try {
      if (auth) {
        await signOut(auth);
      }
      localStorage.removeItem('english360_user_uid');
      localStorage.removeItem('token');
      localStorage.removeItem('english360_auth_token');
      setUser(null);
      setHasCompletedAssessmentState(false);
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 5. Reset Password
  const resetPassword = async (email) => {
    if (!email) throw new Error('Please enter your email address.');
    try {
      if (isFirebaseConfigured && auth) {
        await sendPasswordResetEmail(auth, email);
      }
      return { success: true, message: 'Password reset link has been sent to your email.' };
    } catch (error) {
      const friendlyMessage = getFriendlyAuthErrorMessage(error);
      throw new Error(friendlyMessage);
    }
  };

  const value = {
    user,
    currentUser: user,
    loading,
    isAuthenticated: Boolean(user),
    hasCompletedAssessment: Boolean(user?.assessmentCompleted || hasCompletedAssessment),
    setHasCompletedAssessment,
    refreshProfile,
    updateUserState,
    register,
    login,
    googleLogin,
    logout,
    resetPassword,
    isFirebaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
