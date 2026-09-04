/**
 * Translates Firebase Authentication error codes to student-friendly error messages.
 */
export const getFriendlyAuthErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred. Please try again.';

  const code = error.code || error.message || '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email address. Please register first.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please log in.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was closed before completing. Please try again.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. We will redirect you to Google directly.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in request was cancelled. Please try again.';
    case 'auth/operation-not-supported-in-this-environment':
      return 'Google Sign-In is not supported in this browser environment. Please open in Chrome or Safari.';
    case 'auth/web-storage-unsupported':
      return 'Browser storage is disabled or unsupported. Please disable Private Browsing mode or allow cookies.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please wait a few minutes before trying again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Google Sign-In. Please add this domain in Firebase Console > Authentication > Settings > Authorized domains.';
    case 'auth/operation-not-allowed':
      return 'Google Sign-In is not enabled. Please enable Google Sign-In in Firebase Console.';
    default:
      if (typeof error === 'string') return error;
      return error.message || 'Authentication failed. Please try again.';
  }
};
