'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function MemberProfilePage() {
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Load existing user data on mount
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const snap = await getDoc(doc(db, 'users', user.id));

        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            name: data.name || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            address: data.address || '',
          });
        } else {
          // No doc — fall back to AuthContext values
          setProfile({
            name: user.name || '',
            email: user.email || '',
            phone: '',
            address: '',
          });
        }
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError('Kunde inte ladda profilen');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSaved(false);
    setError('');

    try {
      await updateDoc(doc(db, 'users', user.id), {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        updatedAt: new Date().toISOString(),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Kunde inte spara ändringar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Min profil</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Profiluppgifter</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>

            <div>
              <label className="block mb-2">Namn</label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block mb-2">E-post</label>
              <Input
                type="email"
                value={profile.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                E-post kan inte ändras här
              </p>
            </div>

            <div>
              <label className="block mb-2">Telefon</label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block mb-2">Adress</label>
              <Input
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {saved && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm">Ändringar sparade!</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-900 hover:bg-blue-800 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sparar...
                </>
              ) : (
                'Spara ändringar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}