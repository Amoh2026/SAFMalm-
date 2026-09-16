import { NextResponse } from 'next/server';

export async function GET() {
  const result: any = {
    env: {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'set' : 'missing',
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'set' : 'missing',
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
        ? { length: process.env.FIREBASE_PRIVATE_KEY.length }
        : 'missing',
      RESEND_API_KEY: process.env.RESEND_API_KEY ? 'set' : 'missing',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'missing',
    },
    steps: [],
  };

  // Step 1: Firebase Admin init
  try {
    const { cert, getApps, initializeApp } = await import('firebase-admin/app');
    result.steps.push('OK: firebase-admin/app imported');

    if (!getApps().length) {
      const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
      const privateKey = rawKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      result.steps.push('OK: Firebase Admin initialized');
    } else {
      result.steps.push('OK: Firebase Admin already initialized');
    }
  } catch (err: any) {
    result.steps.push('FAIL Firebase init: ' + (err?.message || String(err)));
    result.firebaseErrorStack = String(err?.stack || '').slice(0, 800);
    return NextResponse.json(result);
  }

  // Step 2: Firestore query
  try {
    const { getFirestore } = await import('firebase-admin/firestore');
    const db = getFirestore();
    const snapshot = await db.collection('members').limit(1).get();
    result.steps.push('OK: Firestore query — found ' + snapshot.size + ' docs');
  } catch (err: any) {
    result.steps.push('FAIL Firestore query: ' + (err?.message || String(err)));
    result.firestoreErrorStack = String(err?.stack || '').slice(0, 800);
    return NextResponse.json(result);
  }

  // Step 3: Resend client
  try {
    const { Resend } = await import('resend');
    new Resend(process.env.RESEND_API_KEY);
    result.steps.push('OK: Resend client created');
  } catch (err: any) {
    result.steps.push('FAIL Resend init: ' + (err?.message || String(err)));
    return NextResponse.json(result);
  }

  result.status = 'ALL OK';
  return NextResponse.json(result);
}