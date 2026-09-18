'use client';

// ============================================================
// useChatSidebar — data for the nested chat list in the sidebar
// Returns owned + member rooms + total pending request count
// ============================================================

import { useEffect, useState } from 'react';
import { subscribeUserRooms } from '@/lib/firebase/chat';
import type { ChatRoom } from '@/types/chat';

interface Result {
  ownedRooms: ChatRoom[];
  memberRooms: ChatRoom[];
  totalPending: number;
  loading: boolean;
}

export function useChatSidebar(userId: string | undefined): Result {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setRooms([]);
      setLoading(false);
      return;
    }
    let unsub: (() => void) | undefined;
    try {
      unsub = subscribeUserRooms(userId, (rows) => {
        setRooms(rows);
        setLoading(false);
      });
    } catch (err) {
      console.error('useChatSidebar error:', err);
      setLoading(false);
    }
    return () => {
      if (unsub) unsub();
    };
  }, [userId]);

  const ownedRooms = rooms.filter((r) => r.createdBy === userId);
  const memberRooms = rooms.filter((r) => r.createdBy !== userId);
  const totalPending = ownedRooms.reduce(
    (sum, r) => sum + (r.pendingRequests?.length ?? 0),
    0
  );

  return { ownedRooms, memberRooms, totalPending, loading };
}
