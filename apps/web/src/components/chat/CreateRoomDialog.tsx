'use client';

// ============================================================
// CreateRoomDialog — create a new chat room
// v2 — added maxMembers + requiresApproval (private rooms)
// ============================================================

import { useState } from 'react';
import { Plus, Lock, Users as UsersIcon } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase/client';
import { ALLOWED_MAX_MEMBERS } from '@/types/chat';

interface Props {
  onCreated: (roomId: string) => void;
  t: (key: string) => string;
}

export function CreateRoomDialog({ onCreated, t }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState<number>(15);
  const [requiresApproval, setRequiresApproval] = useState(false);
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
          maxMembers,
          requiresApproval,
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
      setMaxMembers(15);
      setRequiresApproval(false);
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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[90vw] max-w-md z-50 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
            {t('chat.createRoom')}
          </Dialog.Title>

          <div className="space-y-4">
            {/* Name */}
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

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('chat.roomDescription')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                placeholder={t('chat.roomDescriptionPlaceholder')}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
                disabled={submitting}
              />
            </div>

            {/* Max members */}
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                <UsersIcon className="h-3.5 w-3.5" />
                {t('chat.maxMembers')}
              </label>
              <select
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                disabled={submitting}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                {ALLOWED_MAX_MEMBERS.map((n) => (
                  <option key={n} value={n}>
                    {n} {t('chat.members')}
                  </option>
                ))}
              </select>
            </div>

            {/* Privacy */}
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-2">
                <Lock className="h-3.5 w-3.5" />
                {t('chat.roomType')}
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-2 p-2 rounded border-2 cursor-pointer transition hover:bg-gray-50"
                  style={{
                    borderColor: !requiresApproval ? '#1e3a8a' : '#e5e7eb',
                    backgroundColor: !requiresApproval ? '#eff6ff' : 'white',
                  }}
                >
                  <input
                    type="radio"
                    name="roomType"
                    checked={!requiresApproval}
                    onChange={() => setRequiresApproval(false)}
                    disabled={submitting}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t('chat.publicRoom')}
                    </p>
                    <p className="text-xs text-gray-600">
                      {t('chat.publicRoomDesc')}
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-2 rounded border-2 cursor-pointer transition hover:bg-gray-50"
                  style={{
                    borderColor: requiresApproval ? '#1e3a8a' : '#e5e7eb',
                    backgroundColor: requiresApproval ? '#eff6ff' : 'white',
                  }}
                >
                  <input
                    type="radio"
                    name="roomType"
                    checked={requiresApproval}
                    onChange={() => setRequiresApproval(true)}
                    disabled={submitting}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t('chat.privateRoom')}
                    </p>
                    <p className="text-xs text-gray-600">
                      {t('chat.privateRoomDesc')}
                    </p>
                  </div>
                </label>
              </div>
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