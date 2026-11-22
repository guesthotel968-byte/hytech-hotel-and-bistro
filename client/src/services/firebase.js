import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';

export const ADMIN_EMAIL = 'adminhotel968@gmail.com';

// Firebase configuration from environment or project defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment12345678",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hytech-hotel-and-bistro.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hytech-hotel-and-bistro",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hytech-hotel-and-bistro.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
};

let app = null;
let auth = null;
let googleProvider = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (err) {
  console.warn('Firebase init notice:', err);
}

export { auth, googleProvider };

/**
 * Sign in with Google via Firebase Popup
 */
export async function signInWithGoogle() {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Auth is not initialized');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0],
      email: user.email,
      photoURL: user.photoURL,
      isAdmin: user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
    };
  } catch (error) {
    console.error('Firebase Google Sign-In error:', error);
    throw error;
  }
}

/**
 * Sign out
 */
export async function signOutUser() {
  if (auth) {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase signOut error:', e);
    }
  }
  localStorage.removeItem('hytech_user');
}

/**
 * Helper to check if given user is admin
 */
export function isUserAdmin(user) {
  return user && user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
