'use client';

// ============================================================
// useChatRooms — real-time subscription to all chat rooms
// ============================================================
// v2 — filters rooms by visibility rules:
//       - owner always sees own rooms
//       - public rooms always visible
//       - private rooms visible when: owner active OR current occupant
// ============================================================

import { useEffect, useState } from 'react';
import { subscribeRooms } from '@/lib/firebase/chat';
import { canSeeRoom, type ChatRoom } from '@/types/chat';

export function useChatRooms(currentUserId?: string) {
  const [allRooms, setAllRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = subscribeRooms((rows) => {
        setAllRooms(rows);
        setLoading(false);
      });
    } catch (err: any) {
      console.error('useChatRooms error:', err);
      setError(err?.message ?? 'Failed to load rooms');
      setLoading(false);
    }
    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Filter by visibility rules
  const rooms = allRooms.filter((r) => canSeeRoom(r, currentUserId));

  return { rooms, loading, error };
}