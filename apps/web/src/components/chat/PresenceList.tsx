'use client';

// ============================================================
// PresenceList — right sidebar showing online members
// ============================================================

import { Circle } from 'lucide-react';
import type { ChatPresence } from '@/types/chat';

interface Props {
  users: ChatPresence[];
  currentUserId: string | undefined;
  t: (key: string) => string;
}

export function PresenceList({ users, currentUserId, t }: Props) {
  // Sort: me first, then alphabetical
  const sorted = [...users].sort((a, b) => {
    if (a.userId === currentUserId) return -1;
    if (b.userId === currentUserId) return 1;
    return a.userName.localeCompare(b.userName);
  });

  return (
    <div className="hidden md:flex flex-col w-56 shrink-0 border-l border-gray-200 bg-gray-50">
      <div className="px-3 py-2 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          {t('chat.onlineMembers')} ({sorted.length})
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sorted.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            {t('chat.noOnline')}
          </p>
        ) : (
          sorted.map((u) => (
            <div
              key={u.docId}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100"
            >
              <div className="relative">
                <div className="w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center text-[10px] font-semibold text-white">
                  {u.userName?.[0]?.toUpperCase() || '?'}
                </div>
                <Circle
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 ${
                    u.state === 'online'
                      ? 'text-green-500 fill-green-500'
                      : 'text-yellow-500 fill-yellow-500'
                  }`}
                />
              </div>
              <span className="text-sm text-gray-800 truncate">
                {u.userId === currentUserId ? `${u.userName} (${t('chat.you')})` : u.userName}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}