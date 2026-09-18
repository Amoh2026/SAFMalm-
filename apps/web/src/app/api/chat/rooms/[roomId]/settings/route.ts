// ============================================================
// /api/chat/rooms/[roomId]/settings  (PATCH)
// ============================================================
// Owner updates room settings.
// Body: { maxMembers?: number }  (increase only)
//       { requiresApproval?: boolean }
//       { isLocked?: boolean }
// ============================================================

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import {
  verifyChatUser,
  unauthorized,
  badRequest,
  serverError,
} from '@/lib/chat/auth-server';
import { ALLOWED_MAX_MEMBERS } from '@/types/chat';

export const runtime = 'nodejs';

type Params = { params: Promise<{ roomId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await verifyChatUser(req);
  if (!user) return unauthorized();

  try {
    const { roomId } = await params;
    const body = await req.json();

    const db = adminDb();
    const roomRef = db.collection('chatRooms').doc(roomId);
    const snap = await roomRef.get();
    if (!snap.exists) {
      return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
    }
    const data = snap.data()!;
    if (data.createdBy !== user.uid) {
      return new Response(JSON.stringify({ error: 'Only owner can edit settings' }), { status: 403 });
    }

    const updates: Record<string, any> = {};

    // maxMembers — increase only
    if (body?.maxMembers !== undefined) {
      const newMax = Number(body.maxMembers);
      if (!ALLOWED_MAX_MEMBERS.includes(newMax as any)) {
        return badRequest(`maxMembers must be one of: ${ALLOWED_MAX_MEMBERS.join(', ')}`);
      }
      const currentMax = Number(data.maxMembers ?? 15);
      if (newMax < currentMax) {
        return badRequest(`Cannot decrease max members (currently ${currentMax})`);
      }
      updates.maxMembers = newMax;
    }

    // requiresApproval — toggle privacy
    if (body?.requiresApproval !== undefined) {
      updates.requiresApproval = body.requiresApproval === true;
    }

    // isLocked — freeze the room
    if (body?.isLocked !== undefined) {
      updates.isLocked = body.isLocked === true;
    }

    if (Object.keys(updates).length === 0) {
      return badRequest('Nothing to update');
    }

    await roomRef.update(updates);
    return Response.json({ ok: true, updates });
  } catch (err: any) {
    console.error('PATCH /api/chat/rooms/[roomId]/settings error:', err);
    return serverError(err?.message || 'Failed to update settings');
  }
}