// ============================================================
// Server-side auth helper for chat API routes
// ============================================================
// Verifies Firebase ID tokens sent from the client via the
// Authorization header. Returns the decoded user, or null.
// ============================================================

import { adminAuth } from '@/lib/firebase/admin';

export interface ChatAuthUser {
  uid: string;
  email?: string;
  name?: string;
}

export async function verifyChatUser(req: Request): Promise<ChatAuthUser | null> {
  try {
    const header = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!header) return null;

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return null;

    const decoded = await adminAuth().verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: (decoded.name as string) || undefined,
    };
  } catch (err) {
    console.error('verifyChatUser failed:', err);
    return null;
  }
}

export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function badRequest(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function serverError(message = 'Server error'): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}