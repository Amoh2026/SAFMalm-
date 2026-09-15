'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar as CalendarIcon,
  List,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { db } from '@/lib/firebase/client';
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';

type BookingStatus = 'pending' | 'approved' | 'rejected';

interface BookingRow {
  id: string;
  userId: string | null;
  userEmail: string;
  name: string;
  phone: string;
  email: string;
  responsiblePerson: string;
  responsiblePhone: string;
  date: string;
  time: string;
  roomPreference: string;
  rules: boolean;
  status: BookingStatus;
  adminNote: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
  'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December',
];
const DAY_NAMES = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

export function BookingsViewClient() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDayBookings, setSelectedDayBookings] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const rows: BookingRow[] = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          userId: data.userId ?? null,
          userEmail: data.userEmail ?? '',
          name: data.name ?? '',
          phone: data.phone ?? '',
          email: data.email ?? '',
          responsiblePerson: data.responsiblePerson ?? '',
          responsiblePhone: data.responsiblePhone ?? '',
          date: data.date ?? '',
          time: data.time ?? '',
          roomPreference: data.roomPreference ?? '',
          rules: data.rules ?? false,
          status: (data.status as BookingStatus) ?? 'pending',
          adminNote: data.adminNote ?? null,
          createdAt: data.createdAt ?? null,
          updatedAt: data.updatedAt ?? null,
          reviewedAt: data.reviewedAt ?? null,
          reviewedBy: data.reviewedBy ?? null,
        };
      });
      setBookings(rows);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setLoadError(err?.message ?? 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const stats = useMemo(
    () => ({
      all: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      approved: bookings.filter((b) => b.status === 'approved').length,
      rejected: bookings.filter((b) => b.status === 'rejected').length,
    }),
    [bookings]
  );

  const filtered = useMemo(
    () => (statusFilter ? bookings.filter((b) => b.status === statusFilter) : bookings),
    [bookings, statusFilter]
  );

  const setStatus = async (booking: BookingRow, status: BookingStatus) => {
    setUpdatingIds((s) => new Set(s).add(booking.id));
    try {
      const note = adminNotes[booking.id]?.trim() || null;
      await updateDoc(doc(db, 'bookings', booking.id), {
        status,
        adminNote: note,
        reviewedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status, adminNote: note } : b
        )
      );
      setAdminNotes((n) => {
        const copy = { ...n };
        delete copy[booking.id];
        return copy;
      });
      setExpandedId(null);
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Kunde inte uppdatera bokningens status.');
    } finally {
      setUpdatingIds((s) => {
        const copy = new Set(s);
        copy.delete(booking.id);
        return copy;
      });
    }
  };

  const handleApprove = (booking: BookingRow) => setStatus(booking, 'approved');
  const handleReject = (booking: BookingRow) => setStatus(booking, 'rejected');
  const handlePending = (booking: BookingRow) => setStatus(booking, 'pending');

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-400">
            <CheckCircle className="h-3 w-3" /> Godkänd
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

  const getStatusDot = (status: BookingStatus) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getBookingsForDate = (dateStr: string) =>
    bookings.filter((b) => b.date === dateStr);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const today = new Date();

    return (
      <div className="bg-white rounded-xl border-2 border-blue-400 shadow overflow-hidden">
        <div className="p-4 bg-blue-900 text-white flex items-center justify-between">
          <button onClick={prevMonth} className="p-2 hover:bg-blue-800 rounded-lg transition">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-blue-800 rounded-lg transition">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`e-${i}`} className="h-24 bg-gray-50 rounded-lg" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayBookings = getBookingsForDate(dateStr);
              const isToday =
                today.getDate() === day &&
                today.getMonth() === currentMonth &&
                today.getFullYear() === currentYear;

              return (
                <div
                  key={day}
                  onClick={() => dayBookings.length > 0 && setSelectedDayBookings(dateStr)}
                  className={`h-24 rounded-lg p-1 border-2 transition ${
                    isToday ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
                  } ${dayBookings.length > 0 ? 'cursor-pointer hover:border-blue-400' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-semibold ${isToday ? 'text-yellow-600' : 'text-gray-700'}`}>
                      {day}
                    </span>
                    {dayBookings.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                        {dayBookings.length}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {dayBookings.slice(0, 3).map((b, idx) => (
                      <div
                        key={idx}
                        className={`text-[10px] px-1 py-0.5 rounded ${getStatusDot(b.status)} text-white truncate`}
                        title={`${b.time} - ${b.name}`}
                      >
                        {b.time} {b.name.split(' ')[0]}
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-[10px] text-gray-500 pl-1">
                        +{dayBookings.length - 3} fler
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span>Godkänd</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500" /><span>Väntar</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span>Avvisad</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-yellow-600" /><span>Idag</span></div>
          </div>
        </div>
      </div>
    );
  };

  const renderList = () => (
    <div className="bg-white rounded-xl border-2 border-blue-400 shadow overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h2 className="font-semibold text-gray-700">
          Visar {filtered.length} av {bookings.length} bokningar
          {statusFilter &&
            ` (${statusFilter === 'pending' ? 'väntande' : statusFilter === 'approved' ? 'godkända' : 'avvisade'})`}
        </h2>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Inga bokningar hittades</p>
          {statusFilter && (
            <button
              onClick={() => setStatusFilter(null)}
              className="mt-4 text-blue-600 hover:underline"
            >
              Visa alla bokningar
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bokare</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum & Tid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Åtgärd</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((b) => {
                const expanded = expandedId === b.id;
                const isUpdating = updatingIds.has(b.id);
                return (
                  <Fragment key={b.id}>
                    <tr className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{b.name}</div>
                        <div className="text-sm text-gray-500">{b.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{b.date}</div>
                        <div className="text-sm text-gray-500">{b.time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{b.roomPreference || '—'}</span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(b.status)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setExpandedId(expanded ? null : b.id)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          {expanded ? 'Dölj' : 'Visa'}
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="bg-blue-50">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-800 mb-2">Kontaktuppgifter</h3>
                              <div className="text-sm space-y-1 text-gray-700">
                                <p><strong>Telefon:</strong> {b.phone || '—'}</p>
                                <p><strong>E-post:</strong> {b.email || '—'}</p>
                                <p><strong>Ansvarig:</strong> {b.responsiblePerson || '—'} ({b.responsiblePhone || '—'})</p>
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800 mb-2">Bokningsdetaljer</h3>
                              <div className="text-sm space-y-1 text-gray-700">
                                <p><strong>Datum:</strong> {b.date}</p>
                                <p><strong>Tid:</strong> {b.time}</p>
                                <p><strong>Rum:</strong> {b.roomPreference || '—'}</p>
                                <p><strong>Regler accepterade:</strong> {b.rules ? '✅ Ja' : '❌ Nej'}</p>
                                {b.createdAt && (
                                  <p><strong>Skapad:</strong> {String(b.createdAt).slice(0, 19).replace('T', ' ')}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {b.adminNote && (
                            <div className="bg-blue-100 border border-blue-300 rounded p-3 mb-4 text-sm">
                              <strong>Admin-notering:</strong>
                              <p className="mt-1">{b.adminNote}</p>
                            </div>
                          )}

                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Meddelande till bokare (valfritt)
                            </label>
                            <Textarea
                              value={adminNotes[b.id] ?? ''}
                              onChange={(e) =>
                                setAdminNotes((n) => ({ ...n, [b.id]: e.target.value }))
                              }
                              placeholder="T.ex. 'Godkänt, larmkod skickas separat'"
                              rows={2}
                              disabled={isUpdating}
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              onClick={() => handleApprove(b)}
                              disabled={isUpdating}
                              className={`flex-1 text-white ${
                                b.status === 'approved'
                                  ? 'bg-green-800 hover:bg-green-900 ring-2 ring-green-400'
                                  : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Godkänn
                              {b.status === 'approved' && ' ✓'}
                            </Button>

                            <Button
                              onClick={() => handleReject(b)}
                              disabled={isUpdating}
                              className={`flex-1 text-white ${
                                b.status === 'rejected'
                                  ? 'bg-red-800 hover:bg-red-900 ring-2 ring-red-400'
                                  : 'bg-red-600 hover:bg-red-700'
                              }`}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-2" />
                              )}
                              Avvisa
                              {b.status === 'rejected' && ' ✓'}
                            </Button>

                            <Button
                              onClick={() => handlePending(b)}
                              disabled={isUpdating}
                              variant="outline"
                              className={`flex-1 border-2 ${
                                b.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-900 border-yellow-500 ring-2 ring-yellow-400'
                                  : 'text-yellow-700 border-yellow-400 hover:bg-yellow-50'
                              }`}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Clock className="h-4 w-4 mr-2" />
                              )}
                              Väntande
                              {b.status === 'pending' && ' ✓'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto" />
          <p className="mt-4 text-gray-600">Laddar bokningar...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6 text-red-800">
          <p className="font-semibold mb-1">Kunde inte ladda bokningar</p>
          <p className="text-sm">{loadError}</p>
          <Button onClick={fetchBookings} className="mt-4 bg-red-600 hover:bg-red-700">
            Försök igen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Bokningshantering</h1>
          <p className="text-gray-500 mt-1">Hantera alla bokningar och förfrågningar</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchBookings} title="Uppdatera">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg border-2 transition flex items-center gap-2 ${
              viewMode === 'calendar'
                ? 'bg-blue-900 text-white border-blue-900'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            <CalendarIcon className="h-4 w-4" /> Kalender
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg border-2 transition flex items-center gap-2 ${
              viewMode === 'list'
                ? 'bg-blue-900 text-white border-blue-900'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            <List className="h-4 w-4" /> Lista
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div
          onClick={() => setStatusFilter(null)}
          className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition ${
            !statusFilter ? 'border-blue-600 bg-blue-50' : 'border-blue-400 hover:border-blue-600'
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
          onClick={() => setStatusFilter('pending')}
          className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition ${
            statusFilter === 'pending'
              ? 'border-yellow-600 bg-yellow-50'
              : 'border-yellow-400 hover:border-yellow-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Väntande</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('approved')}
          className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition ${
            statusFilter === 'approved'
              ? 'border-green-600 bg-green-50'
              : 'border-green-400 hover:border-green-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Godkända</p>
              <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('rejected')}
          className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition ${
            statusFilter === 'rejected'
              ? 'border-red-600 bg-red-50'
              : 'border-red-400 hover:border-red-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Avvisade</p>
              <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
            </div>
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
        </div>
      </div>

      {viewMode === 'calendar' ? renderCalendar() : renderList()}

      {selectedDayBookings && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDayBookings(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Bokningar {selectedDayBookings}</h2>
              <button
                onClick={() => setSelectedDayBookings(null)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            {getBookingsForDate(selectedDayBookings).map((b) => (
              <div key={b.id} className="border rounded p-3 mb-2 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">
                    {b.time} — {b.name}
                  </span>
                  {getStatusBadge(b.status)}
                </div>
                <div className="text-gray-600">
                  {b.email} · {b.roomPreference}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}