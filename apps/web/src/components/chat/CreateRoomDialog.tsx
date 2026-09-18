'use client';

// ============================================================
// CreateRoomDialog — modal to create a new chat room
// ============================================================

import { useState } from 'react';
import { Plus } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase/client';

interface Props {
  onCreated: (roomId: string) => void;
  t: (key: string) => string;
}

export function CreateRoomDialog({ onCreated, t }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim() || name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not signed in');
      const idToken = await currentUser.getIdToken();

      const res = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to create room');
      }

      const data = await res.json();
      setOpen(false);
      setName('');
      setDescription('');
      onCreated(data.id);
    } catch (err: any) {
      console.error('create room error:', err);
      setError(err?.message || 'Failed to create room');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button className="bg-blue-900 hover:bg-blue-800 text-white">
          <Plus className="h-4 w-4 mr-2" />
          {t('chat.createRoom')}
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[90vw] max-w-md z-50">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
            {t('chat.createRoom')}
          </Dialog.Title>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('chat.roomName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 60))}
                placeholder={t('chat.roomNamePlaceholder')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('chat.roomDescription')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                placeholder={t('chat.roomDescriptionPlaceholder')}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
                disabled={submitting}
              />
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
              onClick={handleCreate}
              disabled={submitting || !name.trim()}
              className="bg-blue-900 hover:bg-blue-800 text-white"
            >
              {submitting ? t('chat.creating') : t('chat.create')}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}