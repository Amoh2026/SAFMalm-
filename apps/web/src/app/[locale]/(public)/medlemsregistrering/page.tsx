'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, User, Mail, Phone, Home, Users, CreditCard } from 'lucide-react';

export default function MedlemsregistreringPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'sv';

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    ageGroup: '',
    swishReference: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/member-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Något gick fel. Försök igen.');
      }

      setSuccess(true);
      setForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        ageGroup: '',
        swishReference: '',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Något gick fel. Försök igen.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center px-4 py-12">
        <Card className="max-w-lg w-full border-2 border-green-400 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-3">
              Tack för din ansökan!
            </h1>
            <p className="text-gray-600 mb-6">
              Vi har skickat ett bekräftelsemail till <strong>{form.email || 'din e-post'}</strong>.
              Klicka på länken i e-postmeddelandet för att bekräfta din ansökan.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Länken är giltig i 48 timmar.
            </p>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition"
            >
              Tillbaka till startsidan
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 py-8 md:py-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 mb-3">
            Bli Medlem
          </h1>
          <p className="text-lg text-gray-600">
            Fyll i formuläret nedan för att ansöka om medlemskap i Svensk Algeriska Föreningen i Malmö.
          </p>
        </div>

        <Card className="border-2 border-blue-400 shadow-xl">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
                  <User className="h-4 w-4" /> Namn *
                </label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="För- och efternamn"
                  className="border-2 border-blue-300 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
                  <Mail className="h-4 w-4" /> E-post *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="namn@exempel.se"
                  className="border-2 border-blue-300 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
                  <Phone className="h-4 w-4" /> Telefon *
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="070-xxx xx xx"
                  className="border-2 border-blue-300 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
                  <Home className="h-4 w-4" /> Adress
                </label>
                <Input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Gata, postnummer, ort"
                  className="border-2 border-blue-300 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
                  <Users className="h-4 w-4" /> Åldersgrupp *
                </label>
                <select
                  name="ageGroup"
                  value={form.ageGroup}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 rounded-md border-2 border-blue-300 focus:border-blue-600 bg-white text-sm"
                >
                  <option value="">Välj åldersgrupp</option>
                  <option value="-17">Under 17</option>
                  <option value="17-24">17–24</option>
                  <option value="25-64">25–64</option>
                  <option value="65+">65+</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
                  <CreditCard className="h-4 w-4" /> Swish-referens
                </label>
                <Input
                  name="swishReference"
                  value={form.swishReference}
                  onChange={handleChange}
                  placeholder="Ange ditt Swish-referensnummer"
                  className="border-2 border-blue-300 focus:border-blue-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Medlemsavgiften betalas via Swish till föreningens nummer. Ange referensen här.
                </p>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 text-base rounded-lg shadow-lg"
              >
                {submitting ? 'Skickar...' : 'Skicka ansökan'}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-2">
                Efter att du skickat in formuläret får du ett e-postmeddelande för att bekräfta din adress.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}