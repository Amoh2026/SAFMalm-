// src/app/member/contact/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/firebase/client';
import { collection, addDoc } from 'firebase/firestore';

export default function MemberContactPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      setError('Fyll i alla obligatoriska fält');
      return;
    }

    // Guard: require logged-in user
    const currentUid = user?.id;
    if (!currentUid) {
      setError('Du måste vara inloggad för att skicka meddelanden.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      await addDoc(collection(db, 'messages'), {
        // Who sent it
        fromUserId: currentUid,
        fromEmail: formData.email,
        fromName: formData.name,
        fromPhone: formData.phone || null,

        // Where it's going (for future filtering)
        to: ['admin'],

        // Content
        subject: formData.subject || 'Meddelande från medlem',
        message: formData.message,

        // Workflow
        status: 'unread',
        createdAt: new Date().toISOString(),

        // Reply fields (filled by admin later)
        reply: null,
        repliedAt: null,
        repliedBy: null,
      });

      setSuccess(true);
      setFormData(prev => ({ ...prev, subject: '', message: '', phone: '' }));
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Contact error:', err);
      setError('Något gick fel. Försök igen.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Tillbaka till startsidan
      </button>

      <h1 className="text-3xl font-bold text-blue-900 mb-2">📩 Kontakta Administrationen</h1>
      <p className="text-gray-600 mb-6">
        Skicka reclamation, information, observation eller åsikt till administrationen.
      </p>

      {success && (
        <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 mb-6 text-green-700">
          ✅ Ditt meddelande har skickats! Vi återkommer så snart som möjligt.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 mb-6 text-red-700">
          ❌ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card className="border-2 border-blue-400">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">E-post</p>
                  <p className="text-sm font-medium text-gray-800">safmalmoe@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Telefon</p>
                  <p className="text-sm font-medium text-gray-800">076-257 20 66</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Adress</p>
                  <p className="text-sm font-medium text-gray-800">Jägersrovägen 7A</p>
                  <p className="text-sm font-medium text-gray-800">213 62 Malmö</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="border-2 border-blue-400 shadow-lg">
            <CardHeader className="bg-blue-50 border-b-2 border-blue-400">
              <CardTitle className="text-xl text-blue-900">✉️ Skicka meddelande</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ditt namn *</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-post *</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon (valfritt)</label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="070-123 45 67"
                    className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ämne</label>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Vad gäller ditt meddelande?"
                    className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meddelande *</label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Skriv ditt meddelande här..."
                    rows={5}
                    className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition resize-y"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? '⏳ Skickar...' : <><Send className="h-4 w-4" /> Skicka meddelande</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}