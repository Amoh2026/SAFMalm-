'use client';

// ============================================================
// MessageBubble — single message with name + time
// ============================================================

import { User as UserIcon } from 'lucide-react';
import type { ChatMessage } from '@/types/chat';

interface Props {
  message: ChatMessage;
  isMine: boolean;
  t: (key: string) => string;
}

function formatTime(msg: ChatMessage, t: (key: string) => string): string {
  if (!msg.createdAt) return '';
  const date =
    typeof (msg.createdAt as any)?.toDate === 'function'
      ? (msg.createdAt as any).toDate()
      : new Date(msg.createdAt as any);
  if (isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return t('chat.justNow');
  if (mins < 60) return `${mins} ${t('chat.minutesAgo')}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ${t('chat.hoursAgo')}`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${t('chat.daysAgo')}`;

  return date.toLocaleString('sv-SE', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MessageBubble({ message, isMine, t }: Props) {
  return (
    <div className={`flex gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white ${
          isMine ? 'bg-blue-900' : 'bg-gray-400'
        }`}
      >
        {message.userAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.userAvatar}
            alt=""
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{message.userName?.[0]?.toUpperCase() || <UserIcon className="h-4 w-4" />}</span>
        )}
      </div>

      {/* Bubble */}
      <div
        className={`flex flex-col max-w-[75%] ${
          isMine ? 'items-end' : 'items-start'
        }`}
      >
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-medium text-gray-700">
            {isMine ? t('chat.you') : message.userName}
          </span>
          <span className="text-[10px] text-gray-400">
            {formatTime(message, t)}
          </span>
        </div>

        <div
          className={`px-3 py-2 rounded-2xl text-sm break-words whitespace-pre-wrap ${
            isMine
              ? 'bg-blue-900 text-white rounded-tr-sm'
              : 'bg-gray-100 text-gray-900 rounded-tl-sm'
          }`}
        >
          {message.text}
        </div>

        {/* Attachments (v1 placeholder — visible when present) */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-1 space-y-1">
            {message.attachments.map((att, i) => (
              <a
                key={i}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-blue-700 underline"
              >
                📎 {att.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}