// ============================================================
// /api/chat/rooms/[roomId]/join  (POST)
// ============================================================
// Transactional 15-member limit enforcement.
// Next.js 16: params is a Promise — must be awaited.
// ============================================================

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyChatUser, unauthorized, serverError } from '@/lib/chat/auth-server';
import { MAX_ROOM_MEMBERS } from '@/types/chat';

export const runtime = 'nodejs';

type Params = { params: Promise<{ roomId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const user = await verifyChatUser(req);
  if (!user) return unauthorized();

  try {
    const { roomId } = await params;   // ← NEXT.JS 16 REQUIRES await

    const db = adminDb();
    const roomRef = db.collection('chatRooms').doc(roomId);
    const displayName = user.name || user.email?.split('@')[0] || 'Member';

    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists) throw new Error('not_found');

      const data = snap.data()!;
      const members: any[] = data.members ?? [];

      if (members.some((m) => m.id === user.uid)) {
        return { alreadyMember: true };
      }

      if (members.length >= MAX_ROOM_MEMBERS) {
        throw new Error('room_full');
      }

      const newMembers = [
        ...members,
        {
          id: user.uid,
          name: displayName,
          email: user.email ?? '',
          joinedAt: Date.now(),
        },
      ];

      tx.update(roomRef, {
        members: newMembers,
        memberCount: newMembers.length,
      });

      return { joined: true };
    });

    return Response.json({ ok: true, ...result });
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (msg === 'not_found') {
      return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
    }
    if (msg === 'room_full') {
      return new Response(
        JSON.stringify({ error: `Room is full (max ${MAX_ROOM_MEMBERS})` }),
        { status: 409 }
      );
    }
    console.error('POST /api/chat/rooms/[roomId]/join error:', err);
    return serverError(err?.message || 'Failed to join');
  }
}