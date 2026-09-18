'use client';

// ============================================================
// RoomCard — a single room in the room list
// v2 — shows private lock, owner crown, pending badge
// ============================================================

import Link from 'next/link';
import { MessageSquare, Users, Clock, Lock, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MAX_ROOM_MEMBERS, type ChatRoom } from '@/types/chat';
import { PendingBadge } from './PendingBadge';

interface Props {
  room: ChatRoom;
  currentUserId?: string;
  t: (key: string) => string;
}

function formatRelative(ts: any, t: (key: string) => string): string {
  if (!ts) return '';
  const date = typeof ts?.toDate === 'function' ? ts.toDate() : new Date(ts);
  if (isNaN(date.getTime())) return '';

  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('chat.justNow');
  if (mins < 60) return `${mins} ${t('chat.minutesAgo')}`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} ${t('chat.hoursAgo')}`;
  const d = Math.floor(h / 24);
  return `${d} ${t('chat.daysAgo')}`;
}

export function RoomCard({ room, currentUserId, t }: Props) {
  const count = room.members?.length ?? 0;
  const max = room.maxMembers ?? MAX_ROOM_MEMBERS;
  const full = count >= max;
  const isPrivate = room.requiresApproval === true;
  const isOwner = currentUserId && room.createdBy === currentUserId;
  const pendingCount = (room.pendingRequests ?? []).length;

  return (
    <Link href={`/member/chat/${room.id}`}>
      <Card className="hover:shadow-md transition cursor-pointer h-full border-2 relative">
        {isOwner && pendingCount > 0 && (
          <div className="absolute -top-1.5 -right-1.5 z-10">
            <PendingBadge count={pendingCount} cap={9} />
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="bg-blue-100 text-blue-700 rounded-lg p-2 shrink-0">
                {isPrivate ? (
                  <Lock className="h-5 w-5" />
                ) : (
                  <MessageSquare className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate flex items-center gap-1.5">
                  <span className="truncate">{room.name}</span>
                  {isOwner && (
                    <Crown className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                  )}
                </h3>
                {room.description && (
                  <p className="text-xs text-gray-500 truncate">
                    {room.description}
                  </p>
                )}
              </div>
            </div>
            {full && (
              <span className="text-[10px] font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full shrink-0">
                {t('chat.roomFull')}
              </span>
            )}
          </div>

          {room.lastMessagePreview && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2 italic">
              "{room.lastMessagePreview}"
            </p>
          )}

          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {count}/{max} {t('chat.members')}
            </span>
            {room.lastMessageAt && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelative(room.lastMessageAt, t)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}