'use client';

// ============================================================
// ChatRoomView — main chat layout (messages + presence + video)
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { PresenceList } from './PresenceList';
import { RoomHeader } from './RoomHeader';
import { VideoPanel } from './VideoPanel';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatPresence } from '@/hooks/useChatPresence';
import { useLanguage } from '@/providers/LanguageProvider';
import type { ChatRoom } from '@/types/chat';

interface Props {
  room: ChatRoom;
  roomId: string;
  userId: string | undefined;
  userName: string | undefined;
  isCreator: boolean;
  isMember: boolean;
  onJoin: () => Promise<void>;
  onLeave: () => Promise<void>;
  onDelete: () => Promise<void>;
  joining: boolean;
}

export function ChatRoomView({
  room,
  roomId,
  userId,
  userName,
  isCreator,
  isMember,
  onJoin,
  onLeave,
  onDelete,
  joining,
}: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [videoOpen, setVideoOpen] = useState(false);

  const { messages, loading: messagesLoading } = useChatMessages(
    isMember ? roomId : null
  );

  const { users } = useChatPresence({
    roomId: isMember ? roomId : null,
    userId,
    userName,
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
      <RoomHeader
        room={room}
        isMember={isMember}
        isCreator={isCreator}
        videoOpen={videoOpen}
        onToggleVideo={() => setVideoOpen((v) => !v)}
        onJoin={onJoin}
        onLeave={onLeave}
        onDelete={onDelete}
        onBack={() => router.push('/member/chat')}
        joining={joining}
      />

      {!isMember ? (
        // Non-member preview
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
          <p className="text-sm mb-4">{t('chat.join')}</p>
          <button
            onClick={onJoin}
            disabled={joining}
            className="px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium disabled:opacity-50"
          >
            {joining ? t('chat.joining') : t('chat.join')}
          </button>
        </div>
      ) : (
        <>
          {videoOpen && (
            <div className="border-b border-gray-200">
              <VideoPanel roomId={roomId} userId={userId} userName={userName} t={t} />
            </div>
          )}

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col">
              <MessageList
                messages={messages}
                currentUserId={userId}
                loading={messagesLoading}
                t={t}
              />
              <MessageInput
                roomId={roomId}
                userId={userId}
                userName={userName}
                t={t}
              />
            </div>

            <PresenceList users={users} currentUserId={userId} t={t} />
          </div>
        </>
      )}
    </div>
  );
}