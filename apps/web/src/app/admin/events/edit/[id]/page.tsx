'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EventForm } from '@/components/admin/EventForm';
import { getEvent, updateEvent } from '@/lib/services/events.service';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AdminEventsEditPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      try {
        setLoading(true);
        const event = await getEvent(eventId);
        if (!event) {
          setError('Evenemanget hittades inte.');
          return;
        }
        setInitialData(event);
      } catch (err) {
        console.error('Error loading event:', err);
        setError('Kunde inte ladda evenemanget.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (data: any) => {
    if (!eventId) return;
    await updateEvent(eventId, data);
    router.push('/admin/events');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Laddar evenemang...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/admin/events')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Tillbaka till evenemang
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Redigera evenemang</h1>
      <Card>
        <CardContent className="p-6">
          <EventForm initialData={initialData} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}