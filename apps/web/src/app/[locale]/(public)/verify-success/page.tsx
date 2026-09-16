'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function VerifySuccessPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) || 'sv';
  const status = searchParams.get('status') || 'ok';

  const config = {
    ok: {
      icon: CheckCircle,
      color: '#16a34a',
      bg: 'bg-green-100',
      title: 'Tack! Din e-post är bekräftad.',
      text: 'Din medlemsansökan har nu skickats vidare för granskning. Vi kontaktar dig via e-post när den har behandlats.',
    },
    already: {
      icon: CheckCircle,
      color: '#16a34a',
      bg: 'bg-green-100',
      title: 'Din e-post är redan bekräftad.',
      text: 'Du behöver inte klicka på länken igen.',
    },
    expired: {
      icon: Clock,
      color: '#f59e0b',
      bg: 'bg-amber-100',
      title: 'Länken har gått ut.',
      text: 'Bekräftelselänken är giltig i 48 timmar. Skicka in ansökan igen om du fortfarande vill bli medlem.',
    },
    invalid: {
      icon: XCircle,
      color: '#dc2626',
      bg: 'bg-red-100',
      title: 'Ogiltig länk.',
      text: 'Länken är inte korrekt. Kontrollera att du klickade på rätt länk i e-postmeddelandet.',
    },
    error: {
      icon: AlertCircle,
      color: '#dc2626',
      bg: 'bg-red-100',
      title: 'Något gick fel.',
      text: 'Vi kunde inte verifiera din e-post just nu. Försök igen senare eller kontakta oss.',
    },
  }[status] || {
    icon: AlertCircle,
    color: '#dc2626',
    bg: 'bg-red-100',
    title: 'Något gick fel.',
    text: 'Okänd status.',
  };

  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center px-4 py-12">
      <Card className="max-w-lg w-full border-2 border-blue-400 shadow-xl">
        <CardContent className="p-8 text-center">
          <div className={`w-16 h-16 rounded-full ${config.bg} flex items-center justify-center mx-auto mb-4`}>
            <Icon className="h-10 w-10" style={{ color: config.color }} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-3">
            {config.title}
          </h1>
          <p className="text-gray-600 mb-6">
            {config.text}
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