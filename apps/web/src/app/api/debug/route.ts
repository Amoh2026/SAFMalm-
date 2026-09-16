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

  // Step 1: try to import firebase-admin
  try {
    const { cert, getApps, initializeApp } = await import('firebase-admin/app');
    result.steps.push('✅ firebase-admin/app imported');

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
      result.steps.push('✅ Firebase Admin initialized');
    } else {
      result.steps.push('ℹ️ Firebase Admin already initialized');
    }
  } catch (err: any) {
    result.steps.push('❌ Firebase init failed: ' + (err?.message || String(err)));
    result.firebaseErrorStack = err?.stack;
    return NextResponse.json(result, { status: 200 });
  }

  // Step 2: try Firestore read
  try {
    const { getFirestore } = await import('firebase-admin/firestore');
    const db = getFirestore();
    const snapshot = await db.collection('members').limit(1).get();
    result.steps.push(`✅ Firestore query OK — found ${snapshot.size} docs`);
  } catch (err: any) {
    result.steps.push('❌ Firestore query failed: ' + (err?.message || String(err)));
    result.firestoreErrorStack = err?.stack;
    return NextResponse.json(result, { status: 200 });
  }

  // Step 3: try Resend init
  try {
    const { Resend } = await import('resend');
    const r = new Resend(process.env.RESEND_API_KEY);
    result.steps.push('✅ Resend client created');
  } catch (err: any) {
    result.steps.push('❌ Resend init failed: ' + (err?.message || String(err)));
    return NextResponse.json(result, { status: 200 });
  }

  result.status = 'ALL OK';
  return NextResponse.json(result);
}