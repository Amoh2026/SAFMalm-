'use client';

import { useRouter } from 'next/navigation';
import { EventForm } from '@/components/admin/EventForm';
import { createEvent } from '@/lib/services/events.service';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminEventsCreatePage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    await createEvent(data);
    router.push('/admin/events');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Skapa evenemang</h1>
      <Card>
        <CardContent className="p-6">
          <EventForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}