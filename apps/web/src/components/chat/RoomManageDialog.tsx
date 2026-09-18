'use client';

// ============================================================
// RoomManageDialog — owner control panel for a private room
// ============================================================

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Settings, Check, X, UserMinus, Crown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase/client';
import {
  ALLOWED_MAX_MEMBERS,
  type ChatRoom,
  type PendingRequest,
} from '@/types/chat';

interface Props {
  room: ChatRoom;
  onChanged: () => void;
  t: (key: string) => string;
  trigger?: React.ReactNode;
}

export function RoomManageDialog({ room, onChanged, t, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pending: PendingRequest[] = room.pendingRequests ?? [];
  const members = room.members ?? [];
  const currentMax = room.maxMembers ?? 15;

  async function callApi(path: string, body: any, method = 'POST') {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not signed in');
    const token = await currentUser.getIdToken();
    const res = await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || `Failed (${res.status})`);
    }
    return res.json().catch(() => ({}));
  }

  async function handleApprove(userId: string) {
    setBusyId(userId);
    setError(null);
    try {
      await callApi(`/api/chat/rooms/${room.id}/approve`, { userId });
      onChanged();
    } catch (err: any) {
      setError(err?.message || 'Failed to approve');
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(userId: string) {
    setBusyId(userId);
    setError(null);
    try {
      await callApi(`/api/chat/rooms/${room.id}/reject`, { userId });
      onChanged();
    } catch (err: any) {
      setError(err?.message || 'Failed to reject');
    } finally {
      setBusyId(null);
    }
  }

  async function handleKick(userId: string, userName: string) {
    if (!window.confirm(`Remove ${userName} from the room?`)) return;
    setBusyId(userId);
    setError(null);
    try {
      await callApi(`/api/chat/rooms/${room.id}/kick`, { userId });
      onChanged();
    } catch (err: any) {
      setError(err?.message || 'Failed to kick');
    } finally {
      setBusyId(null);
    }
  }

  async function handleMaxChange(newMax: number) {
    if (newMax === currentMax) return;
    if (newMax < currentMax) {
      setError('Cannot decrease max members');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await callApi(
        `/api/chat/rooms/${room.id}/settings`,
        { maxMembers: newMax },
        'PATCH'
      );
      onChanged();
    } catch (err: any) {
      setError(err?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger ?? (
          <button
            className="relative p-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            title={t('chat.manageRoom')}
          >
            <Settings className="h-4 w-4" />
            {pending.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                {pending.length}
              </span>
            )}
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[95vw] max-w-lg z-50 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
            {t('chat.manageRoom')}
          </Dialog.Title>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2 mb-4">
              {error}
            </p>
          )}

          {/* Pending requests */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t('chat.pendingRequests')} ({pending.length})
            </h3>
            {pending.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                {t('chat.noPendingRequests')}
              </p>
            ) : (
              <div className="space-y-2">
                {pending.map((req) => (
                  <div
                    key={req.id}
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {req.name}
                        </p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(req.requestedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => handleApprove(req.id)}
                          disabled={busyId === req.id}
                          className="p-1.5 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                          title={t('chat.approve')}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          disabled={busyId === req.id}
                          className="p-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                          title={t('chat.reject')}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {req.message ? (
                      <p className="text-xs text-gray-700 italic mt-1 pl-2 border-l-2 border-blue-300">
                        "{req.message}"
                      </p>
                    ) : (
                      <p className="text-[10px] text-gray-400 italic mt-1">
                        {t('chat.noMessage')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Members */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t('chat.members')} ({members.length}/{currentMax})
            </h3>
            <div className="space-y-1">
              {members.map((m) => {
                const isOwner = m.id === room.createdBy;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isOwner ? (
                        <Crown className="h-4 w-4 text-yellow-500 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-gray-300 shrink-0" />
                      )}
                      <span className="text-sm text-gray-800 truncate">
                        {m.name} {isOwner && `(${t('chat.owner')})`}
                      </span>
                    </div>
                    {!isOwner && (
                      <button
                        onClick={() => handleKick(m.id, m.name)}
                        disabled={busyId === m.id}
                        className="p-1 rounded text-red-600 hover:bg-red-50 disabled:opacity-50"
                        title={t('chat.kick')}
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Settings */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t('chat.settings')}
            </h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('chat.maxMembers')}
              </label>
              <select
                value={currentMax}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                {ALLOWED_MAX_MEMBERS.map((n) => (
                  <option
                    key={n}
                    value={n}
                    disabled={n < currentMax}
                  >
                    {n} {n < currentMax ? `(${t('chat.cannotDecrease')})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-gray-500 mt-1">
                {t('chat.increaseOnly')}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition">
                {t('chat.close')}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}