'use client';

// ============================================================
// useChatPresence — real-time presence + room session tracking
// ============================================================
// v3 — on unmount, non-owner calls /exit-session API so the
//      server can decide whether to remove them from members.
// ============================================================

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/client';
import {
  subscribePresence,
  setPresence,
  clearPresence,
  enterRoomSession,
  setOwnerActive,
  ownerHeartbeat,
} from '@/lib/firebase/chat';
import { SESSION_HEARTBEAT_MS, type ChatPresence } from '@/types/chat';

interface Args {
  roomId: string | null;
  userId: string | undefined;
  userName: string | undefined;
  isOwner?: boolean;
}

export function useChatPresence({ roomId, userId, userName, isOwner }: Args) {
  const [users, setUsers] = useState<ChatPresence[]>([]);

  // Subscribe to presence docs (who's on the room page)
  useEffect(() => {
    if (!roomId) {
      setUsers([]);
      return;
    }
    let unsub: (() => void) | undefined;
    try {
      unsub = subscribePresence(roomId, (rows) => setUsers(rows));
    } catch (err) {
      console.error('useChatPresence subscribe error:', err);
    }
    return () => {
      if (unsub) unsub();
    };
  }, [roomId]);

  // Publish my presence + session membership
  useEffect(() => {
    if (!roomId || !userId || !userName) return;

    // 1. Presence doc (who's online)
    setPresence(roomId, userId, userName).catch((err) =>
      console.error('setPresence error:', err)
    );

    // 2. Join session occupants (for room visibility rules)
    enterRoomSession(roomId, userId).catch((err) =>
      console.error('enterRoomSession error:', err)
    );

    // 3. If owner, mark owner as active
    if (isOwner) {
      setOwnerActive(roomId, true).catch((err) =>
        console.error('setOwnerActive(true) error:', err)
      );
    }

    // 4. Heartbeat every 30s
    const interval = setInterval(() => {
      setPresence(roomId, userId, userName).catch(() => {});
      if (isOwner) {
        ownerHeartbeat(roomId).catch(() => {});
      }
    }, SESSION_HEARTBEAT_MS);

    // 5. Cleanup on unmount
    return () => {
      clearInterval(interval);

      // Clear presence
      clearPresence(roomId, userId).catch(() => {});

      // Notify server of exit
      void notifyExit(roomId, isOwner);

      // If owner, mark owner as inactive
      if (isOwner) {
        setOwnerActive(roomId, false).catch((err) =>
          console.error('setOwnerActive(false) error:', err)
        );
      }
    };
  }, [roomId, userId, userName, isOwner]);

  return { users };
}

/**
 * Call the exit-session endpoint with the user's auth token.
 * The server decides whether to remove them from members.
 */
async function notifyExit(roomId: string, isOwner?: boolean): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Owner doesn't need to call exit-session (server skips it anyway)
    if (isOwner) return;

    const token = await currentUser.getIdToken();

    // Use fetch with keepalive so it fires even on page unload
    await fetch(`/api/chat/rooms/${roomId}/exit-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      keepalive: true,
    });
  } catch (err) {
    // Silently ignore — cleanup is best-effort
    console.error('notifyExit error:', err);
  }
}