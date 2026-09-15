'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { AdminButton } from '@/components/ui/AdminButton';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { db } from '@/lib/firebase/client';
import { doc, deleteDoc } from 'firebase/firestore';

type EventRow = {
  id: string;
  title: string;
  date: string;
  location: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
};

const columns: Column<EventRow>[] = [
  { key: 'title', label: 'Titel' },
  { key: 'date', label: 'Datum' },
  { key: 'location', label: 'Plats' },
  { key: 'status', label: 'Status' },
];

export function EventsTableClient({ events }: { events: EventRow[] }) {
  const [rows, setRows] = useState<EventRow[]>(events);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (event: EventRow) => {
    const confirmed = confirm(
      `Är du säker på att du vill ta bort "${event.title}"?\n\nDetta kan inte ångras.`
    );
    if (!confirmed) return;

    setDeletingIds((s) => new Set(s).add(event.id));
    try {
      await deleteDoc(doc(db, 'events', event.id));
      setRows((prev) => prev.filter((e) => e.id !== event.id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Kunde inte ta bort evenemanget. Försök igen.');
    } finally {
      setDeletingIds((s) => {
        const copy = new Set(s);
        copy.delete(event.id);
        return copy;
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Evenemang</h1>
        <Link href="/admin/events/create">
          <AdminButton variant="primary">+ Skapa evenemang</AdminButton>
        </Link>
      </div>
      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={rows}
            actions={(event) => {
              const isDeleting = deletingIds.has(event.id);
              return (
                <div className="flex gap-2">
                  <Link href={`/admin/events/edit/${event.id}`}>
                    <AdminButton variant="secondary" size="sm" disabled={isDeleting}>
                      Redigera
                    </AdminButton>
                  </Link>
                  <AdminButton
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(event)}
                    loading={isDeleting}
                  >
                    Ta bort
                  </AdminButton>
                </div>
              );
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}