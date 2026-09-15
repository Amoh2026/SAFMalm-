import { getEvents } from '@/lib/services/events.service';
import { EventsTableClient } from './_components/EventsTableClient';

export default async function AdminEventsPage() {
  const events = await getEvents();

  // Convert Firestore Timestamps → plain ISO strings before crossing the boundary
  const sanitized = events.map((e: any) => ({
    id: e.id,
    title: e.title ?? '',
    date: e.date ?? '',
    location: e.location ?? '',
    status: e.status ?? '',
    createdAt:
      typeof e.createdAt?.toDate === 'function'
        ? e.createdAt.toDate().toISOString()
        : e.createdAt ?? null,
    updatedAt:
      typeof e.updatedAt?.toDate === 'function'
        ? e.updatedAt.toDate().toISOString()
        : e.updatedAt ?? null,
  }));

  return <EventsTableClient events={sanitized} />;
}