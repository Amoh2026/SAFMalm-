// ============================================================
// /api/chat/rooms/[roomId]
//   GET    → get room details (must be a member)
//   DELETE → soft-delete (creator only)
// Next.js 16: params is a Promise — must be awaited.
// ============================================================

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyChatUser, unauthorized, serverError } from '@/lib/chat/auth-server';

export const runtime = 'nodejs';

type Params = { params: Promise<{ roomId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const user = await verifyChatUser(req);
  if (!user) return unauthorized();

  try {
    const { roomId } = await params;

    const snap = await adminDb().collection('chatRooms').doc(roomId).get();
    if (!snap.exists) {
      return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
    }
    const data = snap.data()!;
    const isMember = (data.members ?? []).some((m: any) => m.id === user.uid);
    if (!isMember) {
      return new Response(JSON.stringify({ error: 'Not a member' }), { status: 403 });
    }
    return Response.json({ id: snap.id, ...data });
  } catch (err: any) {
    console.error('GET /api/chat/rooms/[roomId] error:', err);
    return serverError(err?.message || 'Failed');
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await verifyChatUser(req);
  if (!user) return unauthorized();

  try {
    const { roomId } = await params;

    const docRef = adminDb().collection('chatRooms').doc(roomId);
    const snap = await docRef.get();
    if (!snap.exists) {
      return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
    }
    const data = snap.data()!;
    if (data.createdBy !== user.uid) {
      return new Response(JSON.stringify({ error: 'Only creator can delete' }), { status: 403 });
    }
    await docRef.update({ isActive: false });
    return Response.json({ ok: true });
  } catch (err: any) {
    console.error('DELETE /api/chat/rooms/[roomId] error:', err);
    return serverError(err?.message || 'Failed');
  }
}