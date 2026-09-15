'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MemberSettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('sv');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Inställningar</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Inställningar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Meddelanden</span>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`px-4 py-2 rounded ${
                notifications ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              {notifications ? 'På' : 'Av'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span>Språk</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="sv">Svenska</option>
              <option value="ar">العربية</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
          <Button variant="destructive" className="mt-4">
            Ta bort konto
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}