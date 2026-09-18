'use client';

// ============================================================
// MessageList — scrollable message feed with auto-scroll
// ============================================================

import { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import type { ChatMessage } from '@/types/chat';

interface Props {
  messages: ChatMessage[];
  currentUserId: string | undefined;
  loading: boolean;
  t: (key: string) => string;
}

export function MessageList({ messages, currentUserId, loading, t }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages (only if near bottom)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (nearBottom || messages.length <= 1) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
        {t('chat.loading')}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6">
        <MessageSquare className="h-10 w-10 mb-2" />
        <p className="text-sm">{t('chat.noMessages')}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-white"
    >
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          message={m}
          isMine={m.userId === currentUserId}
          t={t}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}