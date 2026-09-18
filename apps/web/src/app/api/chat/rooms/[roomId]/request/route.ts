// ============================================================
// /api/chat/rooms/[roomId]/request  (POST)
// ============================================================
// User requests to join a private room.
// Body: { message?: string } (max 200 chars)
// ============================================================

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import {
  verifyChatUser,
  unauthorized,
  badRequest,
  serverError,
} from '@/lib/chat/auth-server';
import { MAX_REQUEST_MESSAGE_LENGTH, MAX_ROOM_MEMBERS } from '@/types/chat';

export const runtime = 'nodejs';

type Params = { params: Promise<{ roomId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const user = await verifyChatUser(req);
  if (!user) return unauthorized();

  try {
    const { roomId } = await params;
    const body = await req.json().catch(() => ({}));
    const rawMessage = String(body?.message ?? '');
    const message = rawMessage.trim().slice(0, MAX_REQUEST_MESSAGE_LENGTH);

    const db = adminDb();
    const roomRef = db.collection('chatRooms').doc(roomId);
    const displayName = user.name || user.email?.split('@')[0] || 'Member';

    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists) throw new Error('not_found');

      const data = snap.data()!;
      const members: any[] = data.members ?? [];
      const pending: any[] = data.pendingRequests ?? [];
      const requiresApproval = data.requiresApproval === true;

      // Already a member?
      if (members.some((m) => m.id === user.uid)) {
        return { alreadyMember: true };
      }

      // Already requested?
      if (pending.some((p) => p.id === user.uid)) {
        return { alreadyRequested: true };
      }

      // Not a private room — reject this endpoint
      if (!requiresApproval) {
        throw new Error('not_private');
      }

      // Max member cap (absolute, applies to members + pending slots)
      const max = Number(data.maxMembers ?? MAX_ROOM_MEMBERS);
      if (members.length + pending.length >= max * 2) {
        // Guard against spam — hard ceiling of 2x max pending
        throw new Error('too_many_requests');
      }

      const newRequest = {
        id: user.uid,
        name: displayName,
        email: user.email ?? '',
        requestedAt: Date.now(),
        message,
      };

      tx.update(roomRef, {
        pendingRequests: [...pending, newRequest],
      });

      return { requested: true };
    });

    return Response.json({ ok: true, ...result });
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (msg === 'not_found') {
      return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
    }
    if (msg === 'not_private') {
      return new Response(
        JSON.stringify({ error: 'This room is public — join directly' }),
        { status: 400 }
      );
    }
    if (msg === 'too_many_requests') {
      return new Response(
        JSON.stringify({ error: 'Too many pending requests for this room' }),
        { status: 409 }
      );
    }
    console.error('POST /api/chat/rooms/[roomId]/request error:', err);
    return serverError(err?.message || 'Failed to request');
  }
}
