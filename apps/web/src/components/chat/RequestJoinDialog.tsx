'use client';

// ============================================================
// RequestJoinDialog — modal for requesting to join a private room
// ============================================================

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Lock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase/client';
import { MAX_REQUEST_MESSAGE_LENGTH, type ChatRoom } from '@/types/chat';

interface Props {
  room: ChatRoom;
  onRequested: () => void;
  t: (key: string) => string;
}

export function RequestJoinDialog({ room, onRequested, t }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequest() {
    setSubmitting(true);
    setError(null);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not signed in');
      const idToken = await currentUser.getIdToken();

      const res = await fetch(`/api/chat/rooms/${room.id}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to send request');
      }

      setOpen(false);
      setMessage('');
      onRequested();
    } catch (err: any) {
      console.error('request join error:', err);
      setError(err?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium">
          {t('chat.requestToJoin')}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[90vw] max-w-md z-50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 text-blue-700 rounded-lg p-2">
                <Lock className="h-5 w-5" />
              </div>
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {t('chat.requestToJoin')}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                className="p-1 rounded hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {t('chat.privateRoomNotice')}
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('chat.requestMessage')}
              </label>
              <textarea
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value.slice(0, MAX_REQUEST_MESSAGE_LENGTH))
                }
                placeholder={t('chat.requestMessagePlaceholder')}
                rows={3}
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
              />
              <p className="text-[10px] text-gray-400 mt-1 text-right">
                {message.length} / {MAX_REQUEST_MESSAGE_LENGTH}
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={() => setOpen(false)}
              disabled={submitting}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              {t('chat.cancel')}
            </button>
            <Button
              onClick={handleRequest}
              disabled={submitting}
              className="bg-blue-900 hover:bg-blue-800 text-white"
            >
              {submitting ? t('chat.sending') : t('chat.sendRequest')}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}