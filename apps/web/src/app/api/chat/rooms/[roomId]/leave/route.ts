// ============================================================
// /api/chat/rooms/[roomId]/leave  (POST)
// Next.js 16: params is a Promise — must be awaited.
// ============================================================

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyChatUser, unauthorized, serverError } from '@/lib/chat/auth-server';

export const runtime = 'nodejs';

type Params = { params: Promise<{ roomId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const user = await verifyChatUser(req);
  if (!user) return unauthorized();

  try {
    const { roomId } = await params;

    const db = adminDb();
    const roomRef = db.collection('chatRooms').doc(roomId);
    const snap = await roomRef.get();
    if (!snap.exists) {
      return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
    }

    const data = snap.data()!;
    const members: any[] = data.members ?? [];
    const remaining = members.filter((m) => m.id !== user.uid);

    await roomRef.update({
      members: remaining,
      memberCount: remaining.length,
    });

    return Response.json({ ok: true });
  } catch (err: any) {
    console.error('POST /api/chat/rooms/[roomId]/leave error:', err);
    return serverError(err?.message || 'Failed to leave');
  }
}