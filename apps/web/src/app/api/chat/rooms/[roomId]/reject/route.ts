// ============================================================
// /api/chat/rooms/[roomId]/reject  (POST)
// ============================================================
// Owner rejects a pending join request.
// Body: { userId: string }
// ============================================================

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import {
  verifyChatUser,
  unauthorized,
  badRequest,
  serverError,
} from '@/lib/chat/auth-server';

export const runtime = 'nodejs';

type Params = { params: Promise<{ roomId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const user = await verifyChatUser(req);
  if (!user) return unauthorized();

  try {
    const { roomId } = await params;
    const body = await req.json();
    const targetUserId = String(body?.userId ?? '').trim();
    if (!targetUserId) return badRequest('userId required');

    const db = adminDb();
    const roomRef = db.collection('chatRooms').doc(roomId);

    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists) throw new Error('not_found');

      const data = snap.data()!;
      if (data.createdBy !== user.uid) throw new Error('not_owner');

      const pending: any[] = data.pendingRequests ?? [];
      const newPending = pending.filter((p) => p.id !== targetUserId);

      tx.update(roomRef, { pendingRequests: newPending });
      return { rejected: true };
    });

    return Response.json({ ok: true, ...result });
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (msg === 'not_found') {
      return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
    }
    if (msg === 'not_owner') {
      return new Response(JSON.stringify({ error: 'Only owner can reject' }), { status: 403 });
    }
    console.error('POST /api/chat/rooms/[roomId]/reject error:', err);
    return serverError(err?.message || 'Failed to reject');
  }
}