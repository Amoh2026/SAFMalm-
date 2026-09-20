// ============================================================
// /api/chat/rooms/[roomId]/exit-session  (POST)
// ============================================================
// Called when a non-owner leaves the room page.
// If the room is private AND the owner is away (locked),
// remove the user from `members` so they must re-request.
// ============================================================

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyChatUser, unauthorized, serverError } from '@/lib/chat/auth-server';
import { SESSION_STALE_MS } from '@/types/chat';

export const runtime = 'nodejs';

type Params = { params: Promise<{ roomId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const user = await verifyChatUser(req);
  if (!user) return unauthorized();

  try {
    const { roomId } = await params;

    const db = adminDb();
    const roomRef = db.collection('chatRooms').doc(roomId);

    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists) throw new Error('not_found');

      const data = snap.data()!;

      // Owner never leaves their own room
      if (data.createdBy === user.uid) {
        return { skipped: 'owner' };
      }

      // Check if owner is currently active
      const ownerLastActiveAt = data.ownerLastActiveAt;
      let ownerActive = data.ownerIsActive === true;
      if (ownerActive && ownerLastActiveAt) {
        const ms = typeof ownerLastActiveAt?.toMillis === 'function'
          ? ownerLastActiveAt.toMillis()
          : 0;
        if (!ms || Date.now() - ms > SESSION_STALE_MS) {
          ownerActive = false; // stale heartbeat
        }
      }

      const isPrivate = data.requiresApproval === true;
      const members: any[] = data.members ?? [];
      const occupants: string[] = data.sessionOccupants ?? [];

      // Always remove from session occupants
      const newOccupants = occupants.filter((id) => id !== user.uid);

      // Determine if we should also remove from members
      // Only if: private room AND owner is away
      const shouldRemoveFromMembers = isPrivate && !ownerActive;

      let newMembers = members;
      if (shouldRemoveFromMembers) {
        newMembers = members.filter((m) => m.id !== user.uid);
      }

      const updates: Record<string, any> = {
        sessionOccupants: newOccupants,
      };

      if (shouldRemoveFromMembers) {
        updates.members = newMembers;
        updates.memberCount = newMembers.length;
      }

      tx.update(roomRef, updates);

      return {
        ok: true,
        removedFromMembers: shouldRemoveFromMembers,
        removedFromOccupants: true,
      };
    });

    return Response.json(result);
  } catch (err: any) {
    const msg = String(err?.message ?? '');
    if (msg === 'not_found') {
      return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
    }
    console.error('POST /api/chat/rooms/[roomId]/exit-session error:', err);
    return serverError(err?.message || 'Failed to exit session');
  }
}