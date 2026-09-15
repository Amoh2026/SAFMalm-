'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/firebase/client';
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  Mail,
  MailOpen,
  CheckCircle,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Send,
  Filter,
} from 'lucide-react';

type MessageStatus = 'unread' | 'read' | 'replied';

interface MessageRow {
  id: string;
  fromUserId: string;
  fromEmail: string;
  fromName: string;
  fromPhone: string | null;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string | null;
  reply: string | null;
  repliedAt: string | null;
  repliedBy: string | null;
}

export default function AdminMessagesPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<MessageStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user || !isAdmin) {
      router.push('/login');
    }
  }, [user, isAdmin, router]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const rows: MessageRow[] = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          fromUserId: data.fromUserId ?? '',
          fromEmail: data.fromEmail ?? '',
          fromName: data.fromName ?? '',
          fromPhone: data.fromPhone ?? null,
          subject: data.subject ?? '(inget ämne)',
          message: data.message ?? '',
          status: (data.status as MessageStatus) ?? 'unread',
          createdAt: data.createdAt ?? null,
          reply: data.reply ?? null,
          repliedAt: data.repliedAt ?? null,
          repliedBy: data.repliedBy ?? null,
        };
      });
      setMessages(rows);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setLoadError(err?.message ?? 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) fetchMessages();
  }, [user, isAdmin]);

  const stats = useMemo(
    () => ({
      all: messages.length,
      unread: messages.filter((m) => m.status === 'unread').length,
      read: messages.filter((m) => m.status === 'read').length,
      replied: messages.filter((m) => m.status === 'replied').length,
    }),
    [messages]
  );

  const filtered = useMemo(
    () => (filter === 'all' ? messages : messages.filter((m) => m.status === filter)),
    [messages, filter]
  );

  const handleExpand = async (m: MessageRow) => {
    const isOpening = expandedId !== m.id;
    setExpandedId(isOpening ? m.id : null);

    // Auto-mark as read when opening an unread message
    if (isOpening && m.status === 'unread') {
      try {
        await updateDoc(doc(db, 'messages', m.id), {
          status: 'read',
          readAt: Timestamp.now(),
        });
        setMessages((prev) =>
          prev.map((row) => (row.id === m.id ? { ...row, status: 'read' } : row))
        );
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  };

  const handleReply = async (m: MessageRow) => {
    const reply = replyDrafts[m.id]?.trim();
    if (!reply) {
      alert('Skriv ett svar först.');
      return;
    }

    setUpdatingIds((s) => new Set(s).add(m.id));
    try {
      await updateDoc(doc(db, 'messages', m.id), {
        status: 'replied',
        reply,
        repliedAt: Timestamp.now(),
        repliedBy: user?.id ?? null,
      });
      setMessages((prev) =>
        prev.map((row) =>
          row.id === m.id
            ? {
                ...row,
                status: 'replied',
                reply,
                repliedAt: new Date().toISOString(),
                repliedBy: user?.id ?? null,
              }
            : row
        )
      );
      setReplyDrafts((d) => {
        const copy = { ...d };
        delete copy[m.id];
        return copy;
      });
      setExpandedId(null);
    } catch (err) {
      console.error('Reply failed:', err);
      alert('Kunde inte skicka svar.');
    } finally {
      setUpdatingIds((s) => {
        const copy = new Set(s);
        copy.delete(m.id);
        return copy;
      });
    }
  };

  const handleDelete = async (m: MessageRow) => {
    if (!confirm(`Ta bort meddelandet från ${m.fromName}?`)) return;

    setUpdatingIds((s) => new Set(s).add(m.id));
    try {
      await deleteDoc(doc(db, 'messages', m.id));
      setMessages((prev) => prev.filter((row) => row.id !== m.id));
      setExpandedId(null);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Kunde inte ta bort meddelandet.');
    } finally {
      setUpdatingIds((s) => {
        const copy = new Set(s);
        copy.delete(m.id);
        return copy;
      });
    }
  };

  const getStatusBadge = (status: MessageStatus) => {
    switch (status) {
      case 'replied':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-400">
            <CheckCircle className="h-3 w-3" /> Besvarat
          </span>
        );
      case 'read':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-400">
            <MailOpen className="h-3 w-3" /> Läst
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-400">
            <Mail className="h-3 w-3" /> Oläst
          </span>
        );
    }
  };

  const formatDate = (value: any) => {
  if (!value) return '';
  let date: Date;
  if (typeof value?.toDate === 'function') {
    date = value.toDate();
  } else if (typeof value === 'string') {
    date = new Date(value);
  } else {
    return '';
  }
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('sv-SE', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto" />
          <p className="mt-4 text-gray-600">Laddar meddelanden...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6 text-red-800">
          <p className="font-semibold mb-1">Kunde inte ladda meddelanden</p>
          <p className="text-sm">{loadError}</p>
          <Button onClick={fetchMessages} className="mt-4 bg-red-600 hover:bg-red-700">
            Försök igen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Meddelanden</h1>
          <p className="text-gray-500 mt-1">Inkomna meddelanden från medlemmar</p>
        </div>
        <Button variant="outline" onClick={fetchMessages} title="Uppdatera">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stat cards — clickable filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div
          onClick={() => setFilter('all')}
          className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition ${
            filter === 'all'
              ? 'border-blue-600 bg-blue-50'
              : 'border-blue-400 hover:border-blue-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Alla</p>
              <p className="text-2xl font-bold text-blue-900">{stats.all}</p>
            </div>
            <Filter className="h-5 w-5 text-blue-600" />
          </div>
        </div>

        <div
          onClick={() => setFilter('unread')}
          className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition ${
            filter === 'unread'
              ? 'border-yellow-600 bg-yellow-50'
              : 'border-yellow-400 hover:border-yellow-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Olästa</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.unread}</p>
            </div>
            <Mail className="h-5 w-5 text-yellow-600" />
          </div>
        </div>

        <div
          onClick={() => setFilter('read')}
          className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition ${
            filter === 'read'
              ? 'border-blue-600 bg-blue-50'
              : 'border-blue-400 hover:border-blue-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Lästa</p>
              <p className="text-2xl font-bold text-blue-900">{stats.read}</p>
            </div>
            <MailOpen className="h-5 w-5 text-blue-600" />
          </div>
        </div>

        <div
          onClick={() => setFilter('replied')}
          className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition ${
            filter === 'replied'
              ? 'border-green-600 bg-green-50'
              : 'border-green-400 hover:border-green-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Besvarade</p>
              <p className="text-2xl font-bold text-green-900">{stats.replied}</p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </div>

      {/* Message list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">
              {filter === 'all'
                ? 'Inga meddelanden ännu'
                : `Inga ${filter === 'unread' ? 'olästa' : filter === 'read' ? 'lästa' : 'besvarade'} meddelanden`}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="mt-3 text-blue-600 hover:underline text-sm"
              >
                Visa alla meddelanden
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => {
            const expanded = expandedId === m.id;
            const isUpdating = updatingIds.has(m.id);
            return (
              <Card
                key={m.id}
                className={`transition ${
                  m.status === 'unread' ? 'border-2 border-yellow-400' : ''
                }`}
              >
                <CardContent className="p-4">
                  {/* Header row — always visible */}
                  <div
                    className="flex items-center justify-between gap-3 cursor-pointer"
                    onClick={() => handleExpand(m)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {m.status === 'unread' && (
                        <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={`truncate ${
                              m.status === 'unread'
                                ? 'font-bold text-gray-900'
                                : 'font-medium text-gray-700'
                            }`}
                          >
                            {m.subject}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {m.fromName} · {m.fromEmail}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {getStatusBadge(m.status)}
                      <span className="text-xs text-gray-400 hidden sm:inline">
                        {formatDate(m.createdAt)}
                      </span>
                      {expanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {expanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs uppercase mb-1">Avsändare</p>
                          <p className="font-medium text-gray-800">{m.fromName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase mb-1">E-post</p>
                          <a
                            href={`mailto:${m.fromEmail}`}
                            className="text-blue-600 hover:underline"
                          >
                            {m.fromEmail}
                          </a>
                        </div>
                        {m.fromPhone && (
                          <div>
                            <p className="text-gray-500 text-xs uppercase mb-1">Telefon</p>
                            <a
                              href={`tel:${m.fromPhone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {m.fromPhone}
                            </a>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-500 text-xs uppercase mb-1">Skickat</p>
                          <p className="text-gray-700">{formatDate(m.createdAt)}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-xs text-gray-500 uppercase mb-1">Meddelande</p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {m.message}
                        </p>
                      </div>

                      {m.reply && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                          <p className="text-xs text-green-700 uppercase mb-1">
                            Ditt svar · {formatDate(m.repliedAt)}
                          </p>
                          <p className="text-sm text-green-900 whitespace-pre-wrap">
                            {m.reply}
                          </p>
                        </div>
                      )}

                      {/* Reply form — always shown, pre-filled if reply exists */}
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {m.reply ? 'Uppdatera svar' : 'Skriv svar'}
                        </label>
                        <Textarea
                          value={replyDrafts[m.id] ?? m.reply ?? ''}
                          onChange={(e) =>
                            setReplyDrafts((d) => ({ ...d, [m.id]: e.target.value }))
                          }
                          placeholder="Skriv ditt svar till medlemmen..."
                          rows={3}
                          disabled={isUpdating}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={() => handleReply(m)}
                          disabled={isUpdating}
                          className="flex-1 bg-blue-900 hover:bg-blue-800 text-white"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          {m.reply ? 'Uppdatera svar' : 'Skicka svar'}
                        </Button>
                        <Button
                          onClick={() => handleDelete(m)}
                          disabled={isUpdating}
                          variant="destructive"
                          className="flex-1 sm:flex-none"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Ta bort
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}