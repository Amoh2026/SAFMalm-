'use client';

// ============================================================
// /member/chat/[roomId] — single room view
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/providers/LanguageProvider';
import { subscribeRoom } from '@/lib/firebase/chat';
import { ChatRoomView } from '@/components/chat/ChatRoomView';
import { auth } from '@/lib/firebase/client';
import { isUserInRoom, type ChatRoom } from '@/types/chat';

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = String(params?.roomId ?? '');

  const { user, loading: authLoading, isApproved, isAdmin } = useAuth();
  const { t } = useLanguage();

  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.push('/login');
    else if (!isAdmin && !isApproved) router.push('/pending');
  }, [user, authLoading, isApproved, isAdmin, router]);

  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeRoom(roomId, (r) => {
      setRoom(r);
      setRoomNotFound(!r);
      setRoomLoading(false);
    });
    return () => unsub();
  }, [roomId]);

  const callApi = useCallback(
    async (path: string, method = 'POST') => {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not signed in');
      const token = await currentUser.getIdToken();
      const res = await fetch(path, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Failed (${res.status})`);
      }
      return res.json().catch(() => ({}));
    },
    []
  );

  async function handleJoin() {
    setJoining(true);
    try {
      await callApi(`/api/chat/rooms/${roomId}/join`);
    } catch (err: any) {
      alert(err?.message || 'Failed to join');
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave() {
    try {
      await callApi(`/api/chat/rooms/${roomId}/leave`);
      router.push('/member/chat');
    } catch (err: any) {
      alert(err?.message || 'Failed to leave');
    }
  }

  async function handleDelete() {
    try {
      await callApi(`/api/chat/rooms/${roomId}`, 'DELETE');
      router.push('/member/chat');
    } catch (err: any) {
      alert(err?.message || 'Failed to delete');
    }
  }

  if (authLoading || roomLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" />
      </div>
    );
  }
  if (!user) return null;
  if (!isAdmin && !isApproved) return null;

  if (roomNotFound || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white border-2 rounded-lg p-8 max-w-md text-center">
          <p className="text-gray-700 mb-4">Room not found</p>
          <button
            onClick={() => router.push('/member/chat')}
            className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-sm"
          >
            {t('chat.back')}
          </button>
        </div>
      </div>
    );
  }

  const isMember = isUserInRoom(room, user.id);
  const isCreator = room.createdBy === user.id;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        <ChatRoomView
          room={room}
          roomId={roomId}
          userId={user.id}
          userName={user.name}
          isCreator={isCreator}
          isMember={isMember}
          onJoin={handleJoin}
          onLeave={handleLeave}
          onDelete={handleDelete}
          joining={joining}
        />
      </div>
    </div>
  );
}