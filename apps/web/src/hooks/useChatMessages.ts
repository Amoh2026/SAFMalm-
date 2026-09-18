'use client';

// ============================================================
// useChatMessages — real-time messages for one room
// ============================================================

import { useEffect, useState } from 'react';
import { subscribeMessages } from '@/lib/firebase/chat';
import type { ChatMessage } from '@/types/chat';

export function useChatMessages(roomId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let unsub: (() => void) | undefined;
    try {
      unsub = subscribeMessages(roomId, (rows) => {
        setMessages(rows);
        setLoading(false);
      });
    } catch (err: any) {
      console.error('useChatMessages error:', err);
      setError(err?.message ?? 'Failed to load messages');
      setLoading(false);
    }
    return () => {
      if (unsub) unsub();
    };
  }, [roomId]);

  return { messages, loading, error };
}