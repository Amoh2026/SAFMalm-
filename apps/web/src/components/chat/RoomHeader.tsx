'use client';

// ============================================================
// RoomHeader — top bar with room name, actions, video toggle
// v2 — added Manage button for owners + private room icon
// ============================================================

import { ArrowLeft, Video, VideoOff, LogOut, Trash2, Users, Lock, Crown } from 'lucide-react';
import type { ChatRoom } from '@/types/chat';
import { MAX_ROOM_MEMBERS } from '@/types/chat';
import { RoomManageDialog } from './RoomManageDialog';

interface Props {
  room: ChatRoom;
  isMember: boolean;
  isCreator: boolean;
  videoOpen: boolean;
  onToggleVideo: () => void;
  onJoin: () => void;
  onLeave: () => void;
  onDelete: () => void;
  onBack: () => void;
  joining: boolean;
  onManageChanged?: () => void;
  t: (key: string) => string;
}

export function RoomHeader({
  room,
  isMember,
  isCreator,
  videoOpen,
  onToggleVideo,
  onJoin,
  onLeave,
  onDelete,
  onBack,
  joining,
  onManageChanged,
  t,
}: Props) {
  const memberCount = room.members?.length ?? 0;
  const max = room.maxMembers ?? MAX_ROOM_MEMBERS;
  const full = memberCount >= max;
  const isPrivate = room.requiresApproval === true;
  const pendingCount = (room.pendingRequests ?? []).length;

  async function handleLeave() {
    if (window.confirm(t('chat.leaveConfirm'))) {
      await onLeave();
    }
  }

  async function handleDelete() {
    if (window.confirm(t('chat.deleteConfirm'))) {
      await onDelete();
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded hover:bg-gray-200 transition shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4 text-gray-700" />
        </button>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1.5">
            {isPrivate ? (
              <Lock className="h-3.5 w-3.5 text-gray-600 shrink-0" />
            ) : (
              <span>💬</span>
            )}
            <span className="truncate">{room.name}</span>
            {isCreator && (
              <Crown className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
            )}
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {memberCount}/{max}
            </span>
            {full && (
              <span className="text-red-600 font-medium">
                · {t('chat.roomFull')}
              </span>
            )}
            {isPrivate && (
              <span className="text-gray-500">· {t('chat.privateRoom')}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {isCreator && (
          <RoomManageDialog
            room={room}
            onChanged={onManageChanged || (() => {})}
            t={t}
          />
        )}

        {isMember && (
          <button
            onClick={onToggleVideo}
            className={`p-2 rounded-lg transition ${
              videoOpen
                ? 'bg-blue-900 text-white hover:bg-blue-800'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
            title={videoOpen ? t('chat.stopVideo') : t('chat.startVideo')}
          >
            {videoOpen ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          </button>
        )}

       {isMember && !isCreator && (
  <button
    onClick={handleLeave}
    className="p-2 rounded-lg bg-white border border-gray-300 ..."
    title={t('chat.leave')}
  >
    <LogOut className="h-4 w-4" />
  </button>
)}

        {isCreator && (
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition"
            title={t('chat.delete')}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        {!isMember && !isPrivate && (
          <button
            onClick={onJoin}
            disabled={joining || full}
            className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-medium disabled:opacity-50"
          >
            {joining ? '...' : full ? t('chat.roomFull') : t('chat.join')}
          </button>
        )}
      </div>
    </div>
  );
}