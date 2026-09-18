'use client';

// ============================================================
// MessageInput — text input + send button
// ============================================================

import { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendMessage } from '@/lib/firebase/chat';
import { MAX_MESSAGE_LENGTH } from '@/types/chat';

interface Props {
  roomId: string;
  userId: string | undefined;
  userName: string | undefined;
  disabled?: boolean;
  t: (key: string) => string;
}

export function MessageInput({ roomId, userId, userName, disabled, t }: Props) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const canSend = !disabled && !sending && text.trim().length > 0 && !!userId;

  async function handleSend() {
    if (!canSend || !userId || !userName) return;
    const value = text.trim();
    if (!value) return;

    setSending(true);
    try {
      await sendMessage(roomId, {
        userId,
        userName,
        text: value,
        type: 'text',
      });
      setText('');
    } catch (err: any) {
      console.error('send message error:', err);
      // Fallback: alert (v1)
      alert(err?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white p-3">
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.typeMessage')}
          rows={1}
          disabled={disabled || sending}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent disabled:bg-gray-50"
          style={{ minHeight: '42px', maxHeight: '120px' }}
        />
        <Button
          onClick={handleSend}
          disabled={!canSend}
          className="bg-blue-900 hover:bg-blue-800 text-white h-[42px] px-4"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {text.length > MAX_MESSAGE_LENGTH * 0.9 && (
        <p className="text-[10px] text-gray-400 mt-1 text-right">
          {text.length} / {MAX_MESSAGE_LENGTH}
        </p>
      )}
    </div>
  );
}