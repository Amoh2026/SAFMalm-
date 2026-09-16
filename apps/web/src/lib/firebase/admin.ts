import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

function initAdmin() {
  if (getApps().length) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawKey) {
    throw new Error(
      'Missing Firebase Admin env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
    );
  }

  // Strip surrounding quotes if present, convert literal \n to real newlines
  const privateKey = rawKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');

  initializeApp({
    credential: cert({
      projectId,
      privateKey,
      clientEmail,
    }),
  });
}

let _db: ReturnType<typeof getFirestore> | null = null;
let _auth: ReturnType<typeof getAdminAuth> | null = null;

function getDb() {
  if (!_db) {
    initAdmin();
    _db = getFirestore();
  }
  return _db;
}

function getAdminAuthInstance() {
  if (!_auth) {
    initAdmin();
    _auth = getAdminAuth();
  }
  return _auth;
}

export const adminDb = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

export const adminAuth = new Proxy({} as ReturnType<typeof getAdminAuth>, {
  get(_target, prop) {
    return (getAdminAuthInstance() as any)[prop];
  },
});