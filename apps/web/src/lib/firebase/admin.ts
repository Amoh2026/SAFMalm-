import { Firestore } from 'fires2rest';

function initDb() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawKey) {
    throw new Error('Missing Firebase Admin env vars');
  }

  const privateKey = rawKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');

  return Firestore.useServiceAccount(projectId, {
    clientEmail,
    privateKey,
  });
}

let _db: Firestore | null = null;

function getDb() {
  if (!_db) {
    _db = initDb();
  }
  return _db;
}

export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});