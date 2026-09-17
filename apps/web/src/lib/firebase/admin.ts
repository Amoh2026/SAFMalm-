import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

function initApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawKey) {
    throw new Error('Missing Firebase Admin env vars');
  }

  const privateKey = rawKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

let _db: Firestore | null = null;
let _auth: Auth | null = null;

function getDb(): Firestore {
  if (!_db) {
    initApp();
    _db = getFirestore();
  }
  return _db;
}

export function adminAuth(): Auth {
  if (!_auth) {
    initApp();
    _auth = getAuth();
  }
  return _auth;
}

export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});