"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { Settings, Save, ArrowLeft, Globe, Phone, MapPin, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { t, getCurrentLanguage } from '@/lib/translations';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [lang, setLang] = useState('sv');
  const [settings, setSettings] = useState({
    associationName: 'Svensk Algeriska Föreningen',
    email: 'info@algeriskaföreningen.se',
    phone: '+46 70 123 45 67',
    address: 'Malmö, Sverige',
    description: 'Förenar Sverige och Algeriet. Vi bygger broar mellan kulturer genom gemenskap och evenemang.',
    facebook: 'https://www.facebook.com/p/Svensk-Algeriska-Föreningen-100080588589924/',
    instagram: 'https://www.instagram.com/svenskalgeriska/',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLang(getCurrentLanguage());
  }, []);

  const tr = (key: string) => t(lang, key, 'navigation');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Laddar...</p>
      </div>
    );
  }

  const handleSave = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    alert('? Inställningar sparade!');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/admin/dashboard')}
            className="border-2 border-blue-400 hover:bg-blue-50 hover:border-blue-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka
          </Button>
          <h1 className="text-3xl font-bold text-blue-900">?? Inställningar</h1>
        </div>
        {saved && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg border-2 border-green-400">
            ? Sparat!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Föreningsinfo */}
        <Card className="border-2 border-blue-400 shadow-lg">
          <CardHeader className="border-b-2 border-blue-400 bg-blue-50/30">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Globe className="h-5 w-5" />
              Föreningsinfo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Föreningens namn</label>
              <Input
                name="associationName"
                value={settings.associationName}
                onChange={handleChange}
                className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivning</label>
              <Textarea
                name="description"
                rows={3}
                value={settings.description}
                onChange={handleChange}
                className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
          </CardContent>
        </Card>

        {/* Kontaktinfo */}
        <Card className="border-2 border-blue-400 shadow-lg">
          <CardHeader className="border-b-2 border-blue-400 bg-blue-50/30">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Phone className="h-5 w-5" />
              Kontaktinfo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Mail className="h-4 w-4" /> E-post
              </label>
              <Input
                name="email"
                type="email"
                value={settings.email}
                onChange={handleChange}
                className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Phone className="h-4 w-4" /> Telefon
              </label>
              <Input
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Adress
              </label>
              <Input
                name="address"
                value={settings.address}
                onChange={handleChange}
                className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="border-2 border-blue-400 shadow-lg">
          <CardHeader className="border-b-2 border-blue-400 bg-blue-50/30">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Settings className="h-5 w-5" />
              Sociala Medier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <Input
                name="facebook"
                value={settings.facebook}
                onChange={handleChange}
                className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <Input
                name="instagram"
                value={settings.instagram}
                onChange={handleChange}
                className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition shadow-lg hover:shadow-xl"
        >
          <Save className="h-4 w-4 mr-2" />
          Spara alla inställningar
        </Button>
      </form>
    </div>
  );
}
