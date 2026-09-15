// src/app/member/boka/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calendar as CalendarIcon, Clock, User, Mail, Phone, CheckCircle, XCircle } from 'lucide-react';
import { db } from '@/lib/firebase/client';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

interface ExistingBooking {
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function MemberBokaPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    responsiblePerson: '',
    responsiblePhone: '',
    roomPreference: 'Ingen preferens',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [existingBookings, setExistingBookings] = useState<ExistingBooking[]>([]);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // Fetch existing bookings (only pending + approved block slots)
  useEffect(() => {
    if (!user) return;
    const fetchExisting = async () => {
      try {
        const q = query(
          collection(db, 'bookings'),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const rows: ExistingBooking[] = snap.docs
          .map((d) => d.data())
          .filter((b: any) => b.status === 'pending' || b.status === 'approved')
          .map((b: any) => ({
            date: b.date ?? '',
            time: b.time ?? '',
            status: b.status ?? 'pending',
          }));
        setExistingBookings(rows);
      } catch (err) {
        console.error('Failed to load existing bookings:', err);
      } finally {
        setBookingsLoaded(true);
      }
    };
    fetchExisting();
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-500">Laddar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Generate available dates (next 30 days, all days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Get available times based on day of week
  const getAvailableTimes = (dateStr: string) => {
    if (!dateStr) return [];

    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const times = [];

    if (isWeekend) {
      for (let i = 8; i < 24; i++) {
        times.push(`${i.toString().padStart(2, '0')}:00`);
        if (i < 23) {
          times.push(`${i.toString().padStart(2, '0')}:30`);
        }
      }
      times.push('23:30');
    } else {
      times.push('16:30');
      for (let i = 17; i < 24; i++) {
        times.push(`${i.toString().padStart(2, '0')}:00`);
        if (i < 23) {
          times.push(`${i.toString().padStart(2, '0')}:30`);
        }
      }
      times.push('23:30');
    }

    return times;
  };

  const getSlotStatus = (date: string, time: string): 'free' | 'pending' | 'approved' => {
    const booking = existingBookings.find(b => b.date === date && b.time === time);
    if (!booking) return 'free';
    return booking.status;
  };

  const isSlotTaken = (date: string, time: string): boolean => {
    return getSlotStatus(date, time) !== 'free';
  };

  const getDayAvailability = (dateStr: string) => {
    const dayBookings = existingBookings.filter(b => b.date === dateStr);
    if (dayBookings.length === 0) {
      return { status: 'free' as const, count: 0 };
    }
    const totalSlots = getAvailableTimes(dateStr).length;
    if (dayBookings.length >= totalSlots) {
      return { status: 'full' as const, count: dayBookings.length };
    }
    return { status: 'partial' as const, count: dayBookings.length };
  };

  const availableDates = getAvailableDates();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime('');
    setError('');
  };

  const handleTimeSelect = (time: string) => {
    if (isSlotTaken(selectedDate, time)) return;
    setSelectedTime(time);
  };

  // Check the slot is still free right before writing (race protection)
  const checkSlotFree = async (date: string, time: string): Promise<boolean> => {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('date', '==', date),
        where('time', '==', time),
        where('status', 'in', ['pending', 'approved'])
      );
      const snap = await getDocs(q);
      return snap.empty;
    } catch (err) {
      console.error('Slot check failed:', err);
      return true; // fail-open: allow attempt, server rules also protect
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      setError('Välj datum och tid');
      return;
    }

    if (!formData.name || !formData.phone || !formData.email) {
      setError('Fyll i alla obligatoriska fält');
      return;
    }

    if (!rulesAccepted) {
      setError('Du måste acceptera reglerna för att boka');
      return;
    }

    if (!user?.id) {
      setError('Du måste vara inloggad för att boka.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      // Race protection: re-check the slot is still free
      const stillFree = await checkSlotFree(selectedDate, selectedTime);
      if (!stillFree) {
        setError('Tyvärr, tiden bokades precis av någon annan. Välj en annan tid.');
        setSubmitting(false);
        // Refresh the taken list
        const refreshed = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')));
        setExistingBookings(
          refreshed.docs
            .map((d) => d.data())
            .filter((b: any) => b.status === 'pending' || b.status === 'approved')
            .map((b: any) => ({ date: b.date ?? '', time: b.time ?? '', status: b.status ?? 'pending' }))
        );
        return;
      }

      const docRef = await addDoc(collection(db, 'bookings'), {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        responsiblePerson: formData.responsiblePerson || formData.name,
        responsiblePhone: formData.responsiblePhone || formData.phone,
        date: selectedDate,
        time: selectedTime,
        roomPreference: formData.roomPreference,
        rules: rulesAccepted,
        userId: user.id,
        userEmail: user.email,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      if (docRef.id) {
        setSuccess(true);
        setFormData({
          name: user.displayName || user.name || '',
          phone: '',
          email: user.email || '',
          responsiblePerson: '',
          responsiblePhone: '',
          roomPreference: 'Ingen preferens',
        });
        setRulesAccepted(false);
        setSelectedDate('');
        setSelectedTime('');

        // Add the new booking to the local taken list
        setExistingBookings(prev => [
          ...prev,
          { date: selectedDate, time: selectedTime, status: 'pending' },
        ]);

        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('Något gick fel. Försök igen.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateInput = (date: Date) => date.toISOString().split('T')[0];
  const getMonthName = (date: Date) => date.toLocaleDateString('sv-SE', { month: 'short' });
  const getDayName = (date: Date) => {
    const days = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];
    return days[date.getDay()];
  };

  const getSelectedDateDisplay = () => selectedDate ? formatDate(selectedDate) : '';
  const isDateSelected = (dateStr: string) => selectedDate === dateStr;
  const isTimeSelected = (time: string) => selectedTime === time;

  const availableTimes = getAvailableTimes(selectedDate);
  const getDayTypeInfo = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    return isWeekend ? '🟢 Hela dagen (08:00 - 23:59)' : '🟡 Efter 16:30';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Tillbaka till startsidan
      </button>

      <h1 className="text-3xl font-bold text-blue-900 mb-2">📅 Boka lokal</h1>
      <p className="text-gray-600 mb-6">
        Välj ett ledigt datum och tid. En admin kommer att granska din förfrågan och kontakta dig.
      </p>

      {!bookingsLoaded && (
        <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-3 mb-6 text-blue-800 text-sm">
          ⏳ Laddar bokade tider...
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 mb-6 text-green-700 flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <div>
            <p className="font-medium">✅ Bokningen har skickats!</p>
            <p className="text-sm">Du får en bekräftelse via e-post.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 mb-6 text-red-700 flex items-center gap-3">
          <XCircle className="h-6 w-6 text-red-500" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Calendar */}
        <div>
          <Card className="border-2 border-blue-400 shadow-lg">
            <CardHeader className="bg-blue-50 border-b-2 border-blue-400">
              <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Välj datum & tid
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4 text-sm text-gray-600 space-y-1">
                <p className="flex flex-wrap items-center gap-4">
                  <span>🟡 <span className="font-medium">Vardagar:</span> 16:30 - 23:59</span>
                  <span>🟢 <span className="font-medium">Helger:</span> 08:00 - 23:59</span>
                </p>
                <p className="text-xs text-gray-500">
                  ✅ Ledig · 🟡 Väntar på godkännande · 🔴 Bokad
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Välj datum *</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableDates.map((date) => {
                    const dateStr = formatDateInput(date);
                    const selected = isDateSelected(dateStr);
                    const dayOfWeek = date.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const dayInfo = getDayAvailability(dateStr);

                    const availLabel =
                      dayInfo.status === 'free'
                        ? '🟢 Ledig'
                        : dayInfo.status === 'full'
                          ? '🔴 Fullbokad'
                          : `🟡 ${dayInfo.count} bokad${dayInfo.count > 1 ? 'e' : ''}`;

                    const availColor = selected
                      ? 'text-yellow-400'
                      : dayInfo.status === 'free'
                        ? 'text-green-600'
                        : dayInfo.status === 'full'
                          ? 'text-red-600'
                          : 'text-yellow-600';

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => handleDateSelect(dateStr)}
                        className={`p-2 text-sm rounded-lg border-2 transition-all duration-200 ${
                          selected
                            ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                            : isWeekend
                              ? 'bg-green-50 text-gray-700 border-green-400 hover:bg-green-100 hover:border-green-600'
                              : 'bg-white text-gray-700 border-blue-400 hover:bg-blue-50 hover:border-blue-600'
                        }`}
                      >
                        <div className="font-medium text-lg">{date.getDate()}</div>
                        <div className={`text-xs ${selected ? 'text-blue-200' : 'text-gray-500'}`}>
                          {getDayName(date)} {getMonthName(date)}
                        </div>
                        <div className={`text-[8px] mt-0.5 font-medium ${availColor}`}>
                          {availLabel}
                        </div>
                        {selected && (
                          <div className="text-[10px] mt-1 text-yellow-400">✓ VALD</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Välj tid *</label>
                    <span className="text-xs text-gray-500">{getDayTypeInfo(selectedDate)}</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                    {availableTimes.map((time) => {
                      const selected = isTimeSelected(time);
                      const slotStatus = getSlotStatus(selectedDate, time);
                      const taken = slotStatus !== 'free';

                      let btnClass = '';
                      if (taken && slotStatus === 'approved') {
                        btnClass = 'bg-red-100 text-red-500 border-red-300 cursor-not-allowed';
                      } else if (taken && slotStatus === 'pending') {
                        btnClass = 'bg-yellow-100 text-yellow-600 border-yellow-300 cursor-not-allowed';
                      } else if (selected) {
                        btnClass = 'bg-blue-900 text-white border-blue-900 shadow-md';
                      } else {
                        btnClass = 'bg-white text-gray-700 border-blue-400 hover:bg-blue-50 hover:border-blue-600';
                      }

                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleTimeSelect(time)}
                          disabled={taken}
                          title={taken ? (slotStatus === 'approved' ? 'Bokad' : 'Väntar på svar') : 'Ledig'}
                          className={`p-2 text-sm rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-1 ${btnClass}`}
                        >
                          <Clock className={`h-3 w-3 ${selected ? 'text-yellow-400' : 'text-gray-400'}`} />
                          {time}
                          {taken && slotStatus === 'approved' && <span className="text-xs ml-1">🔴</span>}
                          {taken && slotStatus === 'pending' && <span className="text-xs ml-1">🟡</span>}
                          {selected && !taken && <span className="text-yellow-400 text-xs ml-1">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!selectedDate && (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-blue-300" />
                  <p>Välj ett datum för att se tillgängliga tider</p>
                </div>
              )}

              {selectedDate && !selectedTime && (
                <div className="text-center py-4 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-blue-300" />
                  <p>Välj en tid</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Booking Form */}
        <div>
          <Card className="border-2 border-blue-400 shadow-lg">
            <CardHeader className="bg-blue-50 border-b-2 border-blue-400">
              <CardTitle className="text-xl text-blue-900">📝 Bokningsformulär</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-400">
                  <p className="text-sm text-blue-900 font-medium mb-2">📅 Vald tid:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2 rounded border border-blue-300">
                      <p className="text-xs text-gray-500">Datum</p>
                      <p className="text-sm font-semibold text-blue-900">
                        {getSelectedDateDisplay() || 'Välj datum'}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded border border-blue-300">
                      <p className="text-xs text-gray-500">Tid</p>
                      <p className="text-sm font-semibold text-blue-900">
                        {selectedTime || 'Välj tid'}
                      </p>
                    </div>
                  </div>
                  {selectedDate && (
                    <div className="text-xs text-blue-600 mt-2 text-center">
                      {getDayTypeInfo(selectedDate)}
                    </div>
                  )}
                  {selectedDate && selectedTime && (
                    <div className="mt-2 text-center text-green-600 text-sm font-medium">
                      ✅ {getSelectedDateDisplay()} kl. {selectedTime}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="h-4 w-4 inline mr-1" />
                    Namn och efternamn *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                    required
                    placeholder="Ditt fullständiga namn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Telefonnummer *
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                    required
                    placeholder="070-123 45 67"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="h-4 w-4 inline mr-1" />
                    E-postadress *
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                    required
                    placeholder="din.epost@exempel.se"
                  />
                </div>

                <div className="border-t-2 border-blue-200 pt-4">
                  <h3 className="text-sm font-bold text-blue-900 mb-2">👤 Ansvarig person (om annan)</h3>
                  <div className="mb-3">
                    <Input
                      name="responsiblePerson"
                      value={formData.responsiblePerson}
                      onChange={handleChange}
                      className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="Ansvarig person"
                    />
                  </div>
                  <div>
                    <Input
                      name="responsiblePhone"
                      value={formData.responsiblePhone}
                      onChange={handleChange}
                      className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="Ansvarig telefon"
                    />
                  </div>
                </div>

                <div className="border-t-2 border-blue-200 pt-4">
                  <h3 className="text-sm font-bold text-blue-900 mb-2">🏠 Rumspreferens</h3>
                  <select
                    name="roomPreference"
                    value={formData.roomPreference}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition"
                  >
                    <option value="Ingen preferens">Spelar ingen roll</option>
                    <option value="Stora salen">Stora salen</option>
                    <option value="Lilla rummet">Lilla rummet</option>
                    <option value="Köket">Köket</option>
                  </select>
                </div>

                <div className="border-t-2 border-blue-200 pt-4">
                  <h3 className="text-sm font-bold text-blue-900 mb-2">📋 Ansvar & Regler</h3>
                  <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800 font-bold mb-2">Du måste acceptera:</p>
                    <ul className="text-sm text-yellow-700 list-disc pl-5 space-y-1">
                      <li>🔑 Ansvar för nyckel/larmkod</li>
                      <li>🧹 Städning efter aktiviteten</li>
                      <li>📄 Acceptera lokalmanualen</li>
                    </ul>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-400">
                    <input
                      type="checkbox"
                      id="rulesAccepted"
                      checked={rulesAccepted}
                      onChange={(e) => setRulesAccepted(e.target.checked)}
                      required
                      className="mt-1 w-5 h-5 accent-blue-900 cursor-pointer"
                    />
                    <label htmlFor="rulesAccepted" className="text-sm text-gray-700 cursor-pointer">
                      ✅ Jag accepterar reglerna *
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting || !selectedDate || !selectedTime}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? '⏳ Skickar...' : <><CheckCircle className="h-5 w-5" /> Skicka bokning</>}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Bokningen skickas till admin för manuell hantering.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}