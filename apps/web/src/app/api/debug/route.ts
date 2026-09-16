import { NextResponse } from 'next/server';

export async function GET() {
  const env = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'set' : 'missing',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL
      ? process.env.FIREBASE_CLIENT_EMAIL.substring(0, 20) + '...'
      : 'missing',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
      ? {
          exists: true,
          length: process.env.FIREBASE_PRIVATE_KEY.length,
          startsWith: process.env.FIREBASE_PRIVATE_KEY.substring(0, 35),
          endsWith: process.env.FIREBASE_PRIVATE_KEY.slice(-35),
        }
      : { exists: false },
    RESEND_API_KEY: process.env.RESEND_API_KEY
      ? {
          exists: true,
          length: process.env.RESEND_API_KEY.length,
          prefix: process.env.RESEND_API_KEY.substring(0, 8),
        }
      : { exists: false },
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'missing',
  };
  return NextResponse.json(env);
}