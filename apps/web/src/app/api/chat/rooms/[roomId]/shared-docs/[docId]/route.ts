// ============================================================
// /api/chat/rooms/[roomId]/shared-docs/[docId]  (DELETE)
// ============================================================

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyChatUser, unauthorized, serverError } from '@/lib/chat/auth-server';

export const runtime = 'nodejs';

type Params = { params: Promise<{ roomId: string; docId: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await verifyChatUser(req);
  if (!user) return unauthorized();

  try {
    const { roomId, docId } = await params;

    const db = adminDb();
    const docRef = db
      .collection('chatRooms')
      .doc(roomId)
      .collection('sharedDocs')
      .doc(docId);

    const snap = await docRef.get();
    if (!snap.exists) {
      return new Response(JSON.stringify({ error: 'Shared doc not found' }), { status: 404 });
    }
    const data = snap.data()!;

    const roomSnap = await db.collection('chatRooms').doc(roomId).get();
    const roomData = roomSnap.data() || {};
    const isOwner = roomData.createdBy === user.uid;
    const isSharer = data.sharedBy === user.uid;

    if (!isOwner && !isSharer) {
      return new Response(JSON.stringify({ error: 'Not allowed' }), { status: 403 });
    }

    await docRef.update({ isActive: false });
    return Response.json({ ok: true });
  } catch (err) {
    console.error('DELETE shared-doc error:', err);
    return serverError();
  }
}