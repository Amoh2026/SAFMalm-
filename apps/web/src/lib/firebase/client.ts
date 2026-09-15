import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ============================================================
// Validate Firebase config (helps catch missing .env variables)
// ============================================================
if (typeof window !== 'undefined') {
  const missingKeys: string[] = [];
  if (!firebaseConfig.apiKey) missingKeys.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) missingKeys.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId) missingKeys.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.storageBucket) missingKeys.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!firebaseConfig.messagingSenderId) missingKeys.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!firebaseConfig.appId) missingKeys.push('NEXT_PUBLIC_FIREBASE_APP_ID');

  if (missingKeys.length > 0) {
    console.error(
      '❌ Missing Firebase environment variables:\n' +
        missingKeys.map((k) => `   - ${k}`).join('\n') +
        '\n\n👉 Add these to apps/web/.env.local and RESTART the dev server.'
    );
  } else {
    console.log('✅ Firebase config loaded. Storage bucket:', firebaseConfig.storageBucket);
  }
}

// ============================================================
// Initialize Firebase (singleton pattern)
// ============================================================
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  if (typeof window !== 'undefined') {
    console.log('✅ Firebase initialized successfully');
    console.log('   - Project ID:', firebaseConfig.projectId);
    console.log('   - Storage bucket:', firebaseConfig.storageBucket);
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  throw error;
}

// ============================================================
// Set persistence (browser session only)
// ============================================================
if (typeof window !== 'undefined') {
  setPersistence(auth, browserSessionPersistence).catch((err) => {
    console.error('Failed to set auth persistence:', err);
  });
}

export { app, auth, db, storage };