'use client';

// ============================================================
// RoomHeader — top bar with room name, actions, video toggle
// ============================================================

import { ArrowLeft, Video, VideoOff, LogOut, Trash2, Users } from 'lucide-react';
import type { ChatRoom } from '@/types/chat';
import { MAX_ROOM_MEMBERS } from '@/types/chat';

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
}: Props) {
  const memberCount = room.members?.length ?? 0;
  const full = memberCount >= MAX_ROOM_MEMBERS;

  async function handleLeave() {
    if (window.confirm('Are you sure you want to leave the room?')) {
      await onLeave();
    }
  }

  async function handleDelete() {
    if (window.confirm('Are you sure you want to delete this room?')) {
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
          <h2 className="text-sm font-semibold text-gray-900 truncate">
            💬 {room.name}
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {memberCount}/{MAX_ROOM_MEMBERS}
            </span>
            {full && <span className="text-red-600 font-medium">· Full</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {isMember && (
          <button
            onClick={onToggleVideo}
            className={`p-2 rounded-lg transition ${
              videoOpen
                ? 'bg-blue-900 text-white hover:bg-blue-800'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
            title={videoOpen ? 'Stop video' : 'Start video'}
          >
            {videoOpen ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          </button>
        )}

        {isMember && (
          <button
            onClick={handleLeave}
            className="p-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition"
            title="Leave room"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}

        {isCreator && (
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition"
            title="Delete room"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        {!isMember && (
          <button
            onClick={onJoin}
            disabled={joining || full}
            className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-medium disabled:opacity-50"
          >
            {joining ? '...' : full ? 'Full' : 'Join'}
          </button>
        )}
      </div>
    </div>
  );
}