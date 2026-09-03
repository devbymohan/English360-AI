import admin from 'firebase-admin';

let isFirebaseAdminReady = false;

export const initFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    isFirebaseAdminReady = true;
    return admin.app();
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'english360-ai';

    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId,
      });
    } else {
      // Initialize with default project ID credentials
      admin.initializeApp({
        projectId,
      });
    }

    isFirebaseAdminReady = true;
    console.log('[Firebase Admin] Initialized successfully');
    return admin.app();
  } catch (error) {
    console.warn(`[Firebase Admin] Initialization notice: ${error.message}`);
    isFirebaseAdminReady = true; // Still ready for fallback verification
    return null;
  }
};

export const getFirebaseAdminStatus = () => isFirebaseAdminReady;

export default admin;