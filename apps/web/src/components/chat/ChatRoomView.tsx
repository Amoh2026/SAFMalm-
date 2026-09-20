'use client';

// ============================================================
// ChatRoomView — main chat layout (messages + presence + video)
// v4 — fixes owner access bug when ownerIsActive is false
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Lock } from 'lucide-react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { PresenceList } from './PresenceList';
import { RoomHeader } from './RoomHeader';
import { VideoPanel } from './VideoPanel';
import { RequestJoinDialog } from './RequestJoinDialog';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatPresence } from '@/hooks/useChatPresence';
import { useLanguage } from '@/providers/LanguageProvider';
import {
  hasPendingRequest,
  canEnterRoom,
  isOwnerActive,
  type ChatRoom,
} from '@/types/chat';

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
  onRefresh: () => void;
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
  onRefresh,
  joining,
}: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [videoOpen, setVideoOpen] = useState(false);

  const isPrivate = room.requiresApproval === true;
  const userPending = hasPendingRequest(room, userId);
  const ownerActive = isOwnerActive(room);

  // 🆕 CRITICAL FIX: Owner is ALWAYS effectively a member of their own room
  const effectiveIsMember = isMember || isCreator;

  // Compute access state
  const access = canEnterRoom(room, userId);

  // Block only if: NOT effective member AND NOT allowed by access rules
  const isBlocked = !effectiveIsMember && !access.allowed;

  // Hooks always fire if user is effectively a member (includes owner)
  const { messages, loading: messagesLoading } = useChatMessages(
    effectiveIsMember ? roomId : null
  );

  const { users } = useChatPresence({
    roomId: effectiveIsMember ? roomId : null,
    userId,
    userName,
    isOwner: isCreator,
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
      <RoomHeader
        room={room}
        isMember={effectiveIsMember}
        isCreator={isCreator}
        videoOpen={videoOpen}
        onToggleVideo={() => setVideoOpen((v) => !v)}
        onJoin={onJoin}
        onLeave={onLeave}
        onDelete={onDelete}
        onBack={() => router.push('/member/chat')}
        joining={joining}
        onManageChanged={onRefresh}
        t={t}
      />

      {/* Non-member states */}
      {!effectiveIsMember ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
          {isBlocked ? (
            // User cannot access this room at all
            <>
              <div className="bg-gray-100 text-gray-600 rounded-full p-4 mb-4">
                <Lock className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-1">
                {t('chat.roomLocked') || 'Rummet är låst'}
              </p>
              <p className="text-sm text-gray-500 text-center max-w-sm">
                {t('chat.roomLockedDesc') ||
                  'Ägaren är inte tillgänglig just nu. Rummet är inte tillgängligt.'}
              </p>
            </>
          ) : userPending ? (
            // Pending approval
            <>
              <div className="bg-blue-100 text-blue-700 rounded-full p-4 mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-1">
                {t('chat.waitingForApproval')}
              </p>
              <p className="text-sm text-gray-500 text-center max-w-sm">
                {t('chat.waitingForApprovalDesc')}
              </p>
            </>
          ) : isPrivate ? (
            // Private room, request to join
            <>
              <p className="text-sm mb-4 text-center max-w-sm">
                {t('chat.privateRoomNotice')}
              </p>
              <RequestJoinDialog
                room={room}
                onRequested={onRefresh}
                t={t}
              />
            </>
          ) : (
            // Public room — show join button
            <>
              <p className="text-sm mb-4">{t('chat.join')}</p>
              <button
                onClick={onJoin}
                disabled={joining}
                className="px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium disabled:opacity-50"
              >
                {joining ? t('chat.joining') : t('chat.join')}
              </button>
            </>
          )}
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