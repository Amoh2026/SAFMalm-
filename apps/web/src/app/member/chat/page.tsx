'use client';

// ============================================================
// /member/chat — room list page
// ============================================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/providers/LanguageProvider';
import { useChatRooms } from '@/hooks/useChatRooms';
import { RoomCard } from '@/components/chat/RoomCard';
import { CreateRoomDialog } from '@/components/chat/CreateRoomDialog';

export default function ChatListPage() {
  const router = useRouter();
  const { user, loading: authLoading, isApproved, isAdmin } = useAuth();
  const { t } = useLanguage();
  const { rooms, loading, error } = useChatRooms();

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.push('/login');
    else if (!isAdmin && !isApproved) router.push('/pending');
  }, [user, authLoading, isApproved, isAdmin, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" />
      </div>
    );
  }
  if (!user) return null;
  if (!isAdmin && !isApproved) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <MessageSquare className="h-7 w-7 text-blue-900" />
              <h1 className="text-3xl font-bold text-blue-900">
                {t('chat.title')}
              </h1>
            </div>
            <p className="text-gray-600 text-sm">{t('chat.roomsDescription')}</p>
          </div>
          <CreateRoomDialog
            onCreated={(id) => router.push(`/member/chat/${id}`)}
            t={t}
          />
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 text-center py-12">
            {t('chat.loading')}
          </p>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-sm text-red-700">
            {t('chat.errorLoading')}: {error}
          </div>
        ) : rooms.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('chat.noRooms')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((r) => (
              <RoomCard key={r.id} room={r} t={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}