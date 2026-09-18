'use client';

// ============================================================
// useChatRooms — real-time subscription to all chat rooms
// ============================================================

import { useEffect, useState } from 'react';
import { subscribeRooms } from '@/lib/firebase/chat';
import type { ChatRoom } from '@/types/chat';

export function useChatRooms() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = subscribeRooms((rows) => {
        setRooms(rows);
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

  return { rooms, loading, error };
}