// ============================================================
// /api/chat/rooms/[roomId]/kick  (POST)
// ============================================================
// Owner removes a member from the room.
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
    if (targetUserId === user.uid) {
      return badRequest('You cannot kick yourself');
    }

    const db = adminDb();
    const roomRef = db.collection('chatRooms').doc(roomId);

    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists) throw new Error('not_found');

      const data = snap.data()!;
      if (data.createdBy !== user.uid) throw new Error('not_owner');

      const members: any[] = data.members ?? [];
      const remaining = members.filter((m) => m.id !== targetUserId);

      if (remaining.length === members.length) {
        return { notMember: true };
      }

      tx.update(roomRef, {
        members: remaining,
        memberCount: remaining.length,
      });

      return { kicked: true };
    });

    return Response.json({ ok: true, ...result });
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (msg === 'not_found') {
      return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
    }
    if (msg === 'not_owner') {
      return new Response(JSON.stringify({ error: 'Only owner can kick' }), { status: 403 });
    }
    console.error('POST /api/chat/rooms/[roomId]/kick error:', err);
    return serverError(err?.message || 'Failed to kick');
  }
}