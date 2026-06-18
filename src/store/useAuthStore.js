/**
 * Auth store — Firebase Authentication.
 * Supports: Email/Password registration with verification, Google Sign-In.
 * User sessions are managed by Firebase (persistent across refreshes).
 */

import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase.js';

const useAuthStore = create((set, get) => ({
  // ─── State ───────────────────────────────
  currentUser: null,        // { uid, name, email, emailVerified, photoURL }
  isAuthenticated: false,
  isLoading: true,          // true until Firebase resolves auth state
  authError: null,

  // ─── Derived ──────────────────────────────
  getUserUid: () => {
    const { currentUser } = get();
    return currentUser?.uid || null;
  },

  // ─── Actions ─────────────────────────────

  /**
   * Register with email + password.
   * Sends a verification email automatically.
   */
  register: async (name, email, password) => {
    set({ authError: null });

    // Client-side validation
    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Please enter your full name (at least 2 characters).' };
    }

    // RFC 5322 simplified email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!email || !emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!password || password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters.' };
    }

    // Password strength: require uppercase, lowercase, number
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return { success: false, error: 'Password must contain uppercase, lowercase, and a number.' };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Set display name
      await updateProfile(user, { displayName: name.trim() });

      // Send verification email
      await sendEmailVerification(user);

      set({
        currentUser: {
          uid: user.uid,
          name: name.trim(),
          email: user.email,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL,
        },
        isAuthenticated: true,
      });

      return { success: true, needsVerification: true };
    } catch (error) {
      const errorMsg = getFirebaseErrorMessage(error.code);
      set({ authError: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  /**
   * Login with email + password.
   */
  login: async (email, password) => {
    set({ authError: null });

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      set({
        currentUser: {
          uid: user.uid,
          name: user.displayName || 'Student',
          email: user.email,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL,
        },
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error) {
      const errorMsg = getFirebaseErrorMessage(error.code);
      set({ authError: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  /**
   * Sign in with Google (popup).
   */
  loginWithGoogle: async () => {
    set({ authError: null });

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      set({
        currentUser: {
          uid: user.uid,
          name: user.displayName || 'Student',
          email: user.email,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL,
        },
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error) {
      // Don't show error if user just closed the popup
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        return { success: false, error: null };
      }
      const errorMsg = getFirebaseErrorMessage(error.code);
      set({ authError: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  /**
   * Resend email verification.
   */
  resendVerification: async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        return { success: true };
      }
      return { success: false, error: 'No user is currently signed in.' };
    } catch {
      return { success: false, error: 'Please wait before requesting another verification email.' };
    }
  },

  /**
   * Refresh user data (check if email is now verified).
   */
  refreshUser: async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const user = auth.currentUser;
      set({
        currentUser: {
          uid: user.uid,
          name: user.displayName || 'Student',
          email: user.email,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL,
        },
      });
    }
  },

  /**
   * Log out.
   */
  logout: async () => {
    try {
      await signOut(auth);
      set({
        currentUser: null,
        isAuthenticated: false,
        authError: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * Update display name.
   */
  updateName: async (newName) => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: newName.trim() });
        const { currentUser } = get();
        set({
          currentUser: { ...currentUser, name: newName.trim() },
        });
      }
    } catch (error) {
      console.error('Update name error:', error);
    }
  },

  /**
   * Initialize auth state listener. Called once on app mount.
   */
  initAuthListener: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        set({
          currentUser: {
            uid: user.uid,
            name: user.displayName || 'Student',
            email: user.email,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          currentUser: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    return unsubscribe;
  },
}));

// ─── Firebase Error Messages ──────────────────────────
function getFirebaseErrorMessage(code) {
  const messages = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    'auth/weak-password': 'Password is too weak. Use at least 8 characters.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site.',
    'auth/account-exists-with-different-credential': 'An account with this email already exists using a different sign-in method.',
  };
  return messages[code] || 'An unexpected error occurred. Please try again.';
}

export default useAuthStore;
