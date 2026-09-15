'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {
  Calendar,
  MessageSquare,
  User,
  Settings,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  MailOpen,
  Inbox,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

interface MemberBooking {
  id: string;
  date: string;
  time: string;
  roomPreference: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote: string | null;
  createdAt: string | null;
}

interface MemberMessage {
  id: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string | null;
  reply: string | null;
  repliedAt: string | null;
}

export default function MemberDashboardPage() {
  const router = useRouter();
  const { user, loading, isApproved, isAdmin } = useAuth();

  const [bookings, setBookings] = useState<MemberBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsOpen, setBookingsOpen] = useState(false);

  const [messages, setMessages] = useState<MemberMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [openMessageIds, setOpenMessageIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (!isApproved) { router.push('/pending'); return; }
  }, [user, loading, isApproved,  router]);

  useEffect(() => {
    const fetchMyBookings = async () => {
      if (!user?.id) return;
      try {
        setBookingsLoading(true);
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', user.id)
        );
        const snap = await getDocs(q);
        const rows: MemberBooking[] = snap.docs.map((d) => {
          const data: any = d.data();
          return {
            id: d.id,
            date: data.date ?? '',
            time: data.time ?? '',
            roomPreference: data.roomPreference ?? '',
            status: (data.status as 'pending' | 'approved' | 'rejected') ?? 'pending',
            adminNote: data.adminNote ?? null,
            createdAt: data.createdAt ?? null,
          };
        });
        rows.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setBookings(rows);
      } catch (err) {
        console.error('Error fetching member bookings:', err);
      } finally {
        setBookingsLoading(false);
      }
    };
    fetchMyBookings();
  }, [user?.id]);

  useEffect(() => {
    const fetchMyMessages = async () => {
      if (!user?.id) return;
      try {
        setMessagesLoading(true);
        const q = query(
          collection(db, 'messages'),
          where('fromUserId', '==', user.id)
        );
        const snap = await getDocs(q);
        const rows: MemberMessage[] = snap.docs.map((d) => {
          const data: any = d.data();
          return {
            id: d.id,
            subject: data.subject ?? '(inget ämne)',
            message: data.message ?? '',
            status: (data.status as 'unread' | 'read' | 'replied') ?? 'unread',
            createdAt: data.createdAt ?? null,
            reply: data.reply ?? null,
            repliedAt: data.repliedAt ?? null,
          };
        });
        rows.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setMessages(rows);
      } catch (err) {
        console.error('Error fetching member messages:', err);
      } finally {
        setMessagesLoading(false);
      }
    };
    fetchMyMessages();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laddar...</p>
        </div>
      </div>
    );
  }

 if (!user) return null;
if (!isAdmin && !isApproved) return null;

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

  const toggleMessage = (id: string) => {
    setOpenMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const closeAllMessages = () => {
    setOpenMessageIds(new Set());
  };

  const getBookingStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-400">
            <CheckCircle2 className="h-3 w-3" /> Godkänd
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-400">
            <XCircle className="h-3 w-3" /> Avvisad
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-400">
            <Clock className="h-3 w-3" /> Väntar
          </span>
        );
    }
  };

  const getMessageStatusBadge = (status: 'unread' | 'read' | 'replied') => {
    switch (status) {
      case 'replied':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-400">
            <MailOpen className="h-3 w-3" /> Besvarat
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
            <Mail className="h-3 w-3" /> Väntar
          </span>
        );
    }
  };

  const quickLinks = [
    { href: '/member/profile', label: 'Min Profil', description: 'Hantera dina uppgifter', icon: User, color: 'bg-blue-100 text-blue-700' },
    { href: '/member/boka', label: 'Boka Lokal', description: 'Boka föreningslokalen', icon: Calendar, color: 'bg-green-100 text-green-700' },
    { href: '/member/contact', label: 'Kontakt', description: 'Kontakta oss', icon: MessageSquare, color: 'bg-purple-100 text-purple-700' },
    { href: '/member/settings', label: 'Inställningar', description: 'Konto & preferenser', icon: Settings, color: 'bg-gray-100 text-gray-700' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-blue-900">
              Välkommen, {user.name}!
            </h1>
          </div>
          <p className="text-gray-600">
            Medlemsdashboard — Svensk Algeriska Föreningen i Malmö
          </p>
        </div>

        <Card className="mb-8 border-2 border-green-400 bg-green-50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-green-200 rounded-full p-3">
              <CheckCircle2 className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="font-semibold text-green-900">Ditt konto är godkänt</p>
              <p className="text-sm text-green-700">
                Du har full tillgång till alla medlemsfunktioner.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="hover:shadow-md transition cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className={`inline-flex p-3 rounded-lg ${link.color} mb-3`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{link.label}</h3>
                    <p className="text-sm text-gray-500">{link.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Mina bokningar */}
        <Card className="mb-6 overflow-hidden">
          <button
            onClick={() => setBookingsOpen(!bookingsOpen)}
            className="w-full text-left"
          >
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition">
              <CardTitle className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-700" />
                  Mina bokningar
                </div>
                {bookingsOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </CardTitle>
            </CardHeader>
          </button>
          {bookingsOpen && (
            <CardContent>
              {bookingsLoading ? (
                <p className="text-sm text-gray-500 text-center py-4">Laddar bokningar...</p>
              ) : bookings.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Du har inga bokningar ännu.</p>
                  <Link href="/member/boka">
                    <Button className="mt-3 bg-blue-900 hover:bg-blue-800 text-white">Boka lokal</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className={`border-2 rounded-lg p-3 ${
                        b.status === 'approved' ? 'border-green-200 bg-green-50'
                        : b.status === 'rejected' ? 'border-red-200 bg-red-50'
                        : 'border-yellow-200 bg-yellow-50'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-semibold text-gray-900">{b.date}</span>
                          <span className="text-gray-600">{b.time}</span>
                          <span className="text-gray-500 text-xs">{b.roomPreference}</span>
                        </div>
                        {getBookingStatusBadge(b.status)}
                      </div>
                      {b.adminNote && (
                        <div className="mt-2 text-xs bg-white border border-gray-200 rounded p-2 text-gray-700">
                          <strong>Meddelande från admin:</strong> {b.adminNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Mina meddelanden */}
        <Card className="mb-6 overflow-hidden">
          <div
            onClick={() => setMessagesOpen(!messagesOpen)}
            className="w-full text-left cursor-pointer"
          >
            <CardHeader className="hover:bg-gray-50 transition">
             <CardTitle className="flex items-center justify-between gap-2">
  <div className="flex items-center gap-2">
    <Inbox className="h-5 w-5 text-blue-700" />
    <span>Mina meddelanden</span>
  </div>
  <div className="flex items-center gap-2">
    {messagesOpen && openMessageIds.size >= 2 && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          closeAllMessages();
        }}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
      >
        <X className="h-3 w-3" />
        Stäng alla
      </button>
    )}
    {messagesOpen ? (
      <ChevronUp className="h-5 w-5 text-gray-400" />
    ) : (
      <ChevronDown className="h-5 w-5 text-gray-400" />
    )}
  </div>
</CardTitle>
            </CardHeader>
          </div>
          {messagesOpen && (
            <CardContent>
              {messagesLoading ? (
                <p className="text-sm text-gray-500 text-center py-4">Laddar meddelanden...</p>
              ) : messages.length === 0 ? (
                <div className="text-center py-6">
                  <Inbox className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Du har inga meddelanden ännu.</p>
                  <Link href="/member/contact">
                    <Button className="mt-3 bg-blue-900 hover:bg-blue-800 text-white">Skicka meddelande</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((m) => {
                    const isExpanded = openMessageIds.has(m.id);
                    return (
                      <div
                        key={m.id}
                        className={`border-2 rounded-lg overflow-hidden transition ${
                          m.status === 'replied' ? 'border-green-200'
                          : m.status === 'read' ? 'border-blue-200'
                          : 'border-yellow-200'
                        }`}
                      >
                        <button
                          onClick={() => toggleMessage(m.id)}
                          className={`w-full text-left p-3 transition ${
                            isExpanded
                              ? 'bg-gray-50'
                              : m.status === 'replied' ? 'bg-green-50 hover:bg-green-100'
                              : m.status === 'read' ? 'bg-blue-50 hover:bg-blue-100'
                              : 'bg-yellow-50 hover:bg-yellow-100'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-3 text-sm min-w-0 flex-1">
                              <span className="font-semibold text-gray-900 truncate">
                                {m.subject}
                              </span>
                              <span className="text-gray-500 text-xs whitespace-nowrap">
                                {formatDate(m.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {getMessageStatusBadge(m.status)}
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-3 bg-white border-t border-gray-200 space-y-2">
                            <div className="text-sm bg-gray-50 border border-gray-200 rounded p-3">
                              <p className="text-xs text-gray-500 mb-1 font-medium">
                                Ditt meddelande:
                              </p>
                              <p className="text-gray-800 whitespace-pre-wrap">{m.message}</p>
                            </div>
                            {m.status === 'replied' && m.reply && (
                              <div className="text-sm bg-green-50 border border-green-300 rounded p-3">
                                <p className="text-xs text-green-700 mb-1 font-medium">
                                  📬 Svar från admin · {formatDate(m.repliedAt)}
                                </p>
                                <p className="text-green-900 whitespace-pre-wrap">{m.reply}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Föreningsinformation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-700" />
              Föreningsinformation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p><strong>Adress:</strong> Jägersrovägen 7A, 213 62 Malmö</p>
            <p><strong>Telefon:</strong> 076-257 20 66</p>
            <p><strong>Email:</strong> safmalmoe@gmail.com</p>
            <p><strong>Org.nr:</strong> 802418-4007</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}