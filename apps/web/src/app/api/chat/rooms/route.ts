// ============================================================
// /api/chat/rooms
//   GET  → list active rooms
//   POST → create a new room (creator becomes first member)
// ============================================================

import { NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import {
  verifyChatUser,
  unauthorized,
  badRequest,
  serverError,
} from '@/lib/chat/auth-server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const user = await verifyChatUser(req);
  if (!user) return unauthorized();

  try {
    const snap = await adminDb()
      .collection('chatRooms')
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const rooms = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return Response.json({ rooms });
  } catch (err) {
    console.error('GET /api/chat/rooms error:', err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyChatUser(req);
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const name = String(body?.name ?? '').trim();
    const description = String(body?.description ?? '').trim();

    if (!name || name.length < 2 || name.length > 60) {
      return badRequest('Room name must be 2-60 characters');
    }
    if (description.length > 200) {
      return badRequest('Description max 200 characters');
    }

    const now = new Date();
    const creatorName = user.name || user.email?.split('@')[0] || 'Member';

    const docRef = await adminDb().collection('chatRooms').add({
      name,
      description,
      createdBy: user.uid,
      createdByName: creatorName,
      createdAt: FieldValue.serverTimestamp(),
      isActive: true,
      memberCount: 1,
      lastMessageAt: null,
      lastMessagePreview: '',
      members: [
        {
          id: user.uid,
          name: creatorName,
          email: user.email ?? '',
          joinedAt: now.getTime(),
        },
      ],
    });

    return Response.json({ id: docRef.id, ok: true });
  } catch (err) {
    console.error('POST /api/chat/rooms error:', err);
    return serverError();
  }
}