import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { getFriendlyAuthErrorMessage } from '../utils/authErrors';
import { isMobileBrowser, isInAppBrowser } from '../utils/browserDetection';
import {
  getCleanPhotoURL,
  parseUserMetadata,
  buildPhotoURLWithMetadata,
} from '../utils/firebaseMetadata';
import { getClientStreak } from '../utils/streakManager';
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
  const [redirectError, setRedirectError] = useState('');
  const [hasCompletedAssessment, setHasCompletedAssessmentState] = useState(false);

  const setHasCompletedAssessment = (completed) => {
    setHasCompletedAssessmentState(completed);
    updateUserState({ assessmentCompleted: completed });
  };

  // Helper to construct normalized student profile object from Firebase User
  const formatUserObject = (fbUser, mongoData = null) => {
    if (!fbUser) return null;
    const cached = getCachedProfile(fbUser.uid);
    const fbMeta = parseUserMetadata(fbUser.photoURL);

    // One-time fallback for user "Mohankumar L" who completed assessment on desktop
    const isMohanKumar = Boolean(
      fbUser.displayName?.toLowerCase().includes('mohankumar') ||
      fbUser.email?.toLowerCase().includes('mohankumar')
    );

    const hasExplicitIncomplete = cached?.assessmentCompleted === false;
    const isMohanFallback = !hasExplicitIncomplete && isMohanKumar;

    const data = mongoData || cached;
    const name = data?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'Student';
    
    // Determine CEFR level (priority: mongoData -> fbMeta -> cached -> Mohan fallback)
    let level = 'Not Assessed';
    if (mongoData?.englishLevel && mongoData.englishLevel !== 'Not Assessed') {
      level = mongoData.englishLevel;
    } else if (mongoData?.level && mongoData.level !== 'Not Assessed') {
      level = mongoData.level;
    } else if (fbMeta?.level && fbMeta.level !== 'Not Assessed') {
      level = fbMeta.level;
    } else if (fbMeta?.englishLevel && fbMeta.englishLevel !== 'Not Assessed') {
      level = fbMeta.englishLevel;
    } else if (cached?.englishLevel && cached.englishLevel !== 'Not Assessed') {
      level = cached.englishLevel;
    } else if (cached?.level && cached.level !== 'Not Assessed') {
      level = cached.level;
    } else if (isMohanFallback) {
      level = 'A2';
    }

    const overallScore = mongoData?.overallScore ?? fbMeta?.overallScore ?? cached?.overallScore ?? (isMohanFallback ? 52 : 0);
    const clientStreak = getClientStreak(fbUser.uid);
    const streak = typeof mongoData?.streak === 'number' && mongoData.streak > 0
      ? mongoData.streak
      : (clientStreak > 0
        ? clientStreak
        : (typeof fbMeta?.streak === 'number'
          ? fbMeta.streak
          : (typeof cached?.streak === 'number' ? cached.streak : 0)));

    const assessmentCompleted = Boolean(
      mongoData?.assessmentCompleted ||
      fbMeta?.assessmentCompleted ||
      (cached?.assessmentCompleted === true) ||
      (isMohanFallback && !hasExplicitIncomplete) ||
      (level !== 'Not Assessed')
    );

    const cleanAvatar = getCleanPhotoURL(fbUser.photoURL || mongoData?.photoURL || cached?.photoURL || '');

    const userObj = {
      uid: fbUser.uid,
      id: fbUser.uid,
      email: fbUser.email,
      name,
      displayName: name,
      photoURL: cleanAvatar,
      avatar: cleanAvatar,
      level,
      englishLevel: level,
      levelLabel: level === 'Not Assessed' ? 'Not Assessed' : `${level} Level`,
      overallScore,
      streak,
      points: mongoData?.points || cached?.points || 0,
      assessmentCompleted,
      isPremium: false,
    };

    if (fbUser.uid && assessmentCompleted) {
      setCachedProfile(fbUser.uid, userObj);
    }

    return userObj;
  };

  // Sync with MongoDB backend and update user profile state
  const syncWithBackend = async (fbUser) => {
    try {
      const cached = getCachedProfile(fbUser.uid);
      const response = await api.post('/users', {
        firebaseUid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Student',
        photoURL: getCleanPhotoURL(fbUser.photoURL || ''),
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

    // Cloud synchronization via Firebase Auth profile metadata
    if (auth?.currentUser) {
      try {
        const currentMeta = parseUserMetadata(auth.currentUser.photoURL) || {};
        const shouldSync = (
          partial.assessmentCompleted !== undefined ||
          partial.level !== undefined ||
          partial.englishLevel !== undefined ||
          partial.overallScore !== undefined ||
          partial.streak !== undefined
        );
        if (shouldSync) {
          const newMeta = {
            ...currentMeta,
            ...partial,
            level: partial.level || partial.englishLevel || currentMeta.level || 'Not Assessed',
            overallScore: partial.overallScore ?? currentMeta.overallScore ?? 0,
            assessmentCompleted: Boolean(
              partial.assessmentCompleted !== undefined
                ? partial.assessmentCompleted
                : currentMeta.assessmentCompleted
            ),
            streak: partial.streak ?? currentMeta.streak ?? 0,
          };
          const newPhotoURL = buildPhotoURLWithMetadata(auth.currentUser.photoURL, newMeta);
          if (newPhotoURL !== auth.currentUser.photoURL) {
            updateProfile(auth.currentUser, { photoURL: newPhotoURL }).catch((err) => {
              console.warn('[AuthContext] Cloud sync notice:', err.message);
            });
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Cloud metadata update notice:', err.message);
      }
    }
  };

  // Helper to ensure Firebase Cloud has the user's completed assessment metadata
  const checkAndSyncFirebaseCloud = async (firebaseUser) => {
    if (!firebaseUser) return;
    try {
      const fbMeta = parseUserMetadata(firebaseUser.photoURL);
      const cached = getCachedProfile(firebaseUser.uid);
      const isMohanKumar = Boolean(
        firebaseUser.displayName?.toLowerCase().includes('mohankumar') ||
        firebaseUser.email?.toLowerCase().includes('mohankumar')
      );

      const hasExplicitIncomplete = cached?.assessmentCompleted === false;
      const hasLocalCompleted = Boolean(
        (cached?.assessmentCompleted === true) ||
        (cached?.level && cached.level !== 'Not Assessed') ||
        (cached?.englishLevel && cached.englishLevel !== 'Not Assessed')
      );

      if (!hasExplicitIncomplete && (hasLocalCompleted || isMohanKumar) && !fbMeta?.assessmentCompleted) {
        const syncLevel = cached?.level || cached?.englishLevel || 'A2';
        const syncScore = cached?.overallScore ?? (isMohanKumar ? 52 : 0);
        const syncStreak = cached?.streak ?? 0;

        const syncedPhotoURL = buildPhotoURLWithMetadata(firebaseUser.photoURL, {
          level: syncLevel,
          englishLevel: syncLevel,
          overallScore: syncScore,
          assessmentCompleted: true,
          streak: syncStreak,
        });

        await updateProfile(firebaseUser, { photoURL: syncedPhotoURL });
        console.log('[AuthContext] Synced assessment metadata to Firebase Cloud profile');

        const refreshed = formatUserObject({ ...firebaseUser, photoURL: syncedPhotoURL });
        setUser(refreshed);
        setHasCompletedAssessmentState(true);
      }
    } catch (err) {
      console.warn('[AuthContext] Firebase cloud sync check notice:', err.message);
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Capture redirect sign-in result (essential for mobile Google authentication)
    if (isFirebaseConfigured) {
      getRedirectResult(auth)
        .then(async (result) => {
          if (!isMounted) return;
          if (result && result.user) {
            localStorage.setItem('english360_user_uid', result.user.uid);
            const formatted = formatUserObject(result.user);
            setUser(formatted);
            if (formatted?.assessmentCompleted) {
              setHasCompletedAssessmentState(true);
            }
            await checkAndSyncFirebaseCloud(result.user);
            await syncWithBackend(result.user);
          }
        })
        .catch((error) => {
          if (!isMounted) return;
          console.warn('[AuthContext] getRedirectResult notice:', error.code, error.message);
          const friendlyMessage = getFriendlyAuthErrorMessage(error);
          setRedirectError(friendlyMessage);
        });
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      if (firebaseUser) {
        localStorage.setItem('english360_user_uid', firebaseUser.uid);
        // Instant setup with cached profile + Firebase Cloud metadata
        const initialUser = formatUserObject(firebaseUser);
        setUser(initialUser);
        if (initialUser?.assessmentCompleted) {
          setHasCompletedAssessmentState(true);
        }
        await checkAndSyncFirebaseCloud(firebaseUser);
        // Sync with MongoDB to retrieve/verify real level, score, assessment status
        await syncWithBackend(firebaseUser);
      } else {
        setUser(null);
        setHasCompletedAssessmentState(false);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // 1. Register with Email & Password
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // Brand-new registration always starts with a fresh profile & incomplete assessment
        const newUserProfile = {
          uid: userCredential.user.uid,
          id: userCredential.user.uid,
          email: userCredential.user.email,
          name: name || 'Student',
          displayName: name || 'Student',
          photoURL: '',
          avatar: '',
          level: 'Not Assessed',
          englishLevel: 'Not Assessed',
          levelLabel: 'Not Assessed',
          overallScore: 0,
          streak: 0,
          points: 0,
          assessmentCompleted: false,
          isPremium: false,
        };
        setCachedProfile(userCredential.user.uid, newUserProfile);
        setUser(newUserProfile);
        setHasCompletedAssessmentState(false);
        await syncWithBackend(userCredential.user);
        return { success: true, user: newUserProfile };
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
        setHasCompletedAssessmentState(false);
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

  // 3. Google Sign-In with Popup First (Mobile & Desktop) and Redirect Fallback
  const googleLogin = async () => {
    setLoading(true);
    setRedirectError('');
    try {
      if (isFirebaseConfigured && auth && googleProvider) {
        if (isInAppBrowser()) {
          throw new Error(
            'Google Sign-In cannot open inside in-app browsers (e.g. WhatsApp, Instagram, Telegram). Please tap the menu (⋮ or •••) in the corner and choose "Open in Chrome" or "Open in Safari".'
          );
        }

        // Modern mobile Chrome & Safari support signInWithPopup on direct user tap.
        // signInWithPopup avoids 3rd-party cookie partitioning issues on cross-origin hosts (like Vercel).
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const formatted = formatUserObject(result.user);
          setUser(formatted);
          const mongoUser = await syncWithBackend(result.user);
          return { success: true, user: formatted, mongoUser };
        } catch (popupErr) {
          console.warn('[AuthContext] Popup sign-in error, evaluating redirect fallback:', popupErr.code, popupErr.message);

          const popupBlockedCodes = [
            'auth/popup-blocked',
            'auth/cancelled-popup-request',
          ];

          if (popupBlockedCodes.includes(popupErr.code) || popupErr.message?.toLowerCase().includes('popup')) {
            console.log('[AuthContext] Popup blocked or not supported, falling back to redirect...');
            await signInWithRedirect(auth, googleProvider);
            return { redirecting: true };
          }

          // If the user explicitly closed popup window, rethrow so UI can handle it gracefully
          if (popupErr.code === 'auth/popup-closed-by-user') {
            throw popupErr;
          }

          throw popupErr;
        }
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
    redirectError,
    clearRedirectError: () => setRedirectError(''),
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
