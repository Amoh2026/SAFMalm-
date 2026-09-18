// ============================================================
// /api/chat/rooms/[roomId]/approve  (POST)
// ============================================================
// Owner approves a pending join request.
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
import { MAX_ROOM_MEMBERS } from '@/types/chat';

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

      // Only owner can approve
      if (data.createdBy !== user.uid) {
        throw new Error('not_owner');
      }

      const members: any[] = data.members ?? [];
      const pending: any[] = data.pendingRequests ?? [];
      const request = pending.find((p) => p.id === targetUserId);
      if (!request) throw new Error('request_not_found');

      // Already a member?
      if (members.some((m) => m.id === targetUserId)) {
        const cleaned = pending.filter((p) => p.id !== targetUserId);
        tx.update(roomRef, { pendingRequests: cleaned });
        return { alreadyMember: true };
      }

      const max = Number(data.maxMembers ?? MAX_ROOM_MEMBERS);
      if (members.length >= max) {
        throw new Error('room_full');
      }

      // Move from pending → members
      const newMembers = [
        ...members,
        {
          id: request.id,
          name: request.name,
          email: request.email ?? '',
          joinedAt: Date.now(),
        },
      ];
      const newPending = pending.filter((p) => p.id !== targetUserId);

      tx.update(roomRef, {
        members: newMembers,
        memberCount: newMembers.length,
        pendingRequests: newPending,
      });

      return { approved: true };
    });

    return Response.json({ ok: true, ...result });
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (msg === 'not_found') {
      return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
    }
    if (msg === 'not_owner') {
      return new Response(JSON.stringify({ error: 'Only owner can approve' }), { status: 403 });
    }
    if (msg === 'request_not_found') {
      return new Response(JSON.stringify({ error: 'Request not found' }), { status: 404 });
    }
    if (msg === 'room_full') {
      return new Response(
        JSON.stringify({ error: 'Room is full. Increase max members first.' }),
        { status: 409 }
      );
    }
    console.error('POST /api/chat/rooms/[roomId]/approve error:', err);
    return serverError(err?.message || 'Failed to approve');
  }
}