'use client';

// ============================================================
// useChatPresence — real-time presence list for one room
// ============================================================

import { useEffect, useState } from 'react';
import { subscribePresence, setPresence, clearPresence } from '@/lib/firebase/chat';
import type { ChatPresence } from '@/types/chat';

interface Args {
  roomId: string | null;
  userId: string | undefined;
  userName: string | undefined;
}

export function useChatPresence({ roomId, userId, userName }: Args) {
  const [users, setUsers] = useState<ChatPresence[]>([]);

  // Subscribe to presence docs
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

  // Publish my presence + cleanup on unmount
  useEffect(() => {
    if (!roomId || !userId || !userName) return;

    setPresence(roomId, userId, userName).catch((err) =>
      console.error('setPresence error:', err)
    );

    // Heartbeat every 30s to refresh lastSeen
    const interval = setInterval(() => {
      setPresence(roomId, userId, userName).catch(() => {});
    }, 30_000);

    // Cleanup: clear presence + interval on unmount
    return () => {
      clearInterval(interval);
      clearPresence(roomId, userId).catch(() => {});
    };
  }, [roomId, userId, userName]);

  return { users };
}