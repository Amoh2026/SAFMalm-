'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type EventFormData = {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: string;
  maxParticipants: number;
  currentParticipants: number;
  docVisibility: string;
  imageVisibility: string;
  author: string;
  authorId: string;
};

type EventFormProps = {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void | Promise<void>;
};

const VISIBILITY_OPTIONS = ['public', 'members', 'admin'];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

const STATUS_LABELS: Record<string, string> = {
  upcoming: 'Kommande',
  ongoing: 'Pågående',
  past: 'Avslutad',
  cancelled: 'Inställd',
};

/** Get today's date as "YYYY-MM-DD" */
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

/** Compute which statuses are valid for the given date + time */
function getValidStatuses(dateStr: string, timeStr: string): string[] {
  if (!dateStr) return ['upcoming', 'ongoing', 'past', 'cancelled'];

  const today = todayStr();

  // Past date → only "past" or "cancelled"
  if (dateStr < today) {
    return ['past', 'cancelled'];
  }

  // Future date → only "upcoming"
  if (dateStr > today) {
    return ['upcoming'];
  }

  // Today → depends on time
  if (dateStr === today) {
    if (!timeStr) {
      return ['upcoming', 'ongoing', 'cancelled'];
    }
    const [h, m] = timeStr.split(':').map(Number);
    const eventTime = new Date();
    eventTime.setHours(h, m, 0, 0);
    const now = new Date();

    if (eventTime.getTime() > now.getTime()) {
      // Future time today
      return ['upcoming', 'ongoing', 'cancelled'];
    } else {
      // Past time today
      return ['ongoing', 'past', 'cancelled'];
    }
  }

  return ['upcoming'];
}

export function EventForm({ initialData, onSubmit }: EventFormProps) {
  const [form, setForm] = useState<EventFormData>({
    title: initialData?.title ?? '',
    date: initialData?.date ?? '',
    time: initialData?.time ?? '',
    location: initialData?.location ?? '',
    description: initialData?.description ?? '',
    status: initialData?.status ?? 'upcoming',
    maxParticipants: initialData?.maxParticipants ?? 0,
    currentParticipants: initialData?.currentParticipants ?? 0,
    docVisibility: initialData?.docVisibility ?? 'public',
    imageVisibility: initialData?.imageVisibility ?? 'public',
    author: initialData?.author ?? '',
    authorId: initialData?.authorId ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof EventFormData>(key: K, value: EventFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  // Split time
  const [timeHour = '', timeMinute = ''] = (form.time || '').split(':');

  const setTime = (h: string, m: string) => {
    if (!h && !m) {
      update('time', '');
    } else {
      update('time', `${h || '00'}:${m || '00'}`);
    }
  };

  // Valid statuses for current date + time
  const validStatuses = useMemo(
    () => getValidStatuses(form.date, form.time),
    [form.date, form.time]
  );

  // Auto-correct status if it becomes invalid
  useEffect(() => {
    if (validStatuses.length > 0 && !validStatuses.includes(form.status)) {
      update('status', validStatuses[0]);
    }
  }, [validStatuses, form.status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) return setError('Titel krävs');
    if (!form.date) return setError('Datum krävs');
    if (!form.time) return setError('Tid krävs');
    if (!form.location.trim()) return setError('Plats krävs');

    if (!validStatuses.includes(form.status)) {
      return setError(`Status "${form.status}" är inte giltig för valt datum/tid.`);
    }

    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.message ?? 'Något gick fel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          Titel <span className="text-red-500">*</span>
        </label>
        <Input
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Evenemangets titel"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Datum <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => update('date', e.target.value)}
            min={todayStr()}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Tid (24h) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <select
              value={timeHour || ''}
              onChange={(e) => setTime(e.target.value, timeMinute)}
              disabled={loading}
              className="flex-1 border rounded-md p-2 text-sm bg-white"
            >
              <option value="">--</option>
              {HOURS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span className="text-gray-500 font-medium">:</span>
            <select
              value={timeMinute || ''}
              onChange={(e) => setTime(timeHour, e.target.value)}
              disabled={loading}
              className="flex-1 border rounded-md p-2 text-sm bg-white"
            >
              <option value="">--</option>
              {MINUTES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Plats <span className="text-red-500">*</span>
        </label>
        <Input
          value={form.location}
          onChange={(e) => update('location', e.target.value)}
          placeholder="Var äger evenemanget rum?"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Beskrivning</label>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={4}
          className="w-full border rounded-md p-2 text-sm"
          placeholder="Kort beskrivning av evenemanget"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Status
            {validStatuses.length === 1 && (
              <span className="text-xs text-gray-500 ml-2">(låst av datum/tid)</span>
            )}
          </label>
          <select
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
            disabled={loading || validStatuses.length === 1}
            className={`w-full border rounded-md p-2 text-sm ${
              validStatuses.length === 1 ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          >
            {validStatuses.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {validStatuses.length === 1
              ? `Endast "${STATUS_LABELS[validStatuses[0]]}" är möjlig`
              : `${validStatuses.length} val möjliga`}
          </p>
        </div>
        <div>
  <label className="block text-sm font-medium mb-1">Max deltagare</label>
  <Input
    type="number"
    min="0"
    step="1"
    value={form.maxParticipants}
    onChange={(e) => {
      const n = Number(e.target.value);
      update('maxParticipants', isNaN(n) || n < 0 ? 0 : Math.floor(n));
    }}
    disabled={loading}
  />
  <p className="text-xs text-gray-500 mt-1">0 = ingen gräns</p>
</div>
        <div>
          <label className="block text-sm font-medium mb-1">Synlighet</label>
          <select
            value={form.docVisibility}
            onChange={(e) => update('docVisibility', e.target.value)}
            className="w-full border rounded-md p-2 text-sm"
            disabled={loading}
          >
            {VISIBILITY_OPTIONS.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Sparar...' : 'Spara'}
        </Button>
      </div>
    </form>
  );
}