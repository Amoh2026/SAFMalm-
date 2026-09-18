// ============================================================
// /api/chat/rooms
//   GET  → list active rooms
//   POST → create a new room (creator becomes first member)
//
// v2 — POST accepts: maxMembers, requiresApproval
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
import { ALLOWED_MAX_MEMBERS, MAX_ROOM_MEMBERS } from '@/types/chat';

export const runtime = 'nodejs';

// ------------------------------------------------------------
// GET /api/chat/rooms
// ------------------------------------------------------------
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

    const rooms = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        maxMembers: data.maxMembers ?? MAX_ROOM_MEMBERS,
        requiresApproval: data.requiresApproval ?? false,
        pendingRequests: data.pendingRequests ?? [],
      };
    });
    return Response.json({ rooms });
  } catch (err) {
    console.error('GET /api/chat/rooms error:', err);
    return serverError();
  }
}

// ------------------------------------------------------------
// POST /api/chat/rooms
// Body: { name, description, maxMembers?, requiresApproval? }
// ------------------------------------------------------------
export async function POST(req: NextRequest) {
  const user = await verifyChatUser(req);
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const name = String(body?.name ?? '').trim();
    const description = String(body?.description ?? '').trim();

    // Validate maxMembers
    const rawMax = Number(body?.maxMembers ?? MAX_ROOM_MEMBERS);
    if (!ALLOWED_MAX_MEMBERS.includes(rawMax as any)) {
      return badRequest(
        `maxMembers must be one of: ${ALLOWED_MAX_MEMBERS.join(', ')}`
      );
    }
    const maxMembers = rawMax;

    // Privacy flag
    const requiresApproval = body?.requiresApproval === true;

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
      // v2 fields
      maxMembers,
      requiresApproval,
      pendingRequests: [],
    });

    return Response.json({ id: docRef.id, ok: true });
  } catch (err) {
    console.error('POST /api/chat/rooms error:', err);
    return serverError();
  }
}