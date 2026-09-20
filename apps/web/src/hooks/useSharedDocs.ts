'use client';

// ============================================================
// useSharedDocs — real-time subscription to shared docs in a room
// ============================================================

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { SharedDocument } from '@/types/chat';

interface Result {
  docs: SharedDocument[];
  loading: boolean;
  error: string | null;
}

export function useSharedDocs(roomId: string | null): Result {
  const [docs, setDocs] = useState<SharedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setDocs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsub: (() => void) | undefined;

    try {
      const q = query(
        collection(db, 'chatRooms', roomId, 'sharedDocs'),
        where('isActive', '==', true),
        orderBy('sharedAt', 'desc'),
        limit(20)
      );

      unsub = onSnapshot(q, (snap) => {
        const rows: SharedDocument[] = snap.docs.map((d) => ({
          id: d.id,
          roomId,
          ...(d.data() as Omit<SharedDocument, 'id' | 'roomId'>),
        }));
        setDocs(rows);
        setLoading(false);
      });
    } catch (err: any) {
      console.error('useSharedDocs error:', err);
      setError(err?.message ?? 'Failed to load shared docs');
      setLoading(false);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [roomId]);

  return { docs, loading, error };
}