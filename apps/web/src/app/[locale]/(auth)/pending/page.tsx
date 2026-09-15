'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/providers/LanguageProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mail, Phone, LogOut, CheckCircle2 } from 'lucide-react';

export default function PendingPage() {
  const router = useRouter();
  const { user, loading, logout, isApproved, isAdmin } = useAuth();
  const { t, locale } = useLanguage();

  const tr = (key: string) => t(`pending.${key}`);

  useEffect(() => {
    if (loading) return;

    // Not logged in → go to login
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    // If already approved or admin → go to correct dashboard
    if (isAdmin) {
      router.push(`/${locale}/admin/dashboard`);
      return;
    }

    if (isApproved) {
      router.push(`/${locale}/member/dashboard`);
      return;
    }
  }, [user, loading, isApproved, isAdmin, router, locale]);

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}/login`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-2 border-yellow-400 shadow-xl">
        <CardContent className="pt-10 pb-10 px-8 text-center">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-100 rounded-full p-6">
              <Clock className="h-16 w-16 text-yellow-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-blue-900 mb-4">
            ⏳ {tr('title')}
          </h1>

          {/* Greeting */}
          {user?.name && (
            <p className="text-lg text-gray-700 mb-6">
              {tr('greeting')}, <span className="font-semibold">{user.name}</span>
            </p>
          )}

          {/* Message */}
          <p className="text-gray-600 leading-relaxed mb-8 max-w-lg mx-auto">
            {tr('message')}
          </p>

          {/* Status Box */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-8 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 text-blue-800 font-semibold">
              <Clock className="h-5 w-5" />
              {tr('statusLabel')}
            </div>
            <p className="text-sm text-blue-700 mt-2">
              {tr('statusText')}
            </p>
          </div>

          {/* Contact Info */}
          <div className="border-t border-gray-200 pt-6 mb-8">
            <p className="text-sm font-semibold text-gray-700 mb-4">
              {tr('contactTitle')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <a
                href="mailto:safmalmoe@gmail.com"
                className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline font-medium"
              >
                <Mail className="h-4 w-4" />
                safmalmoe@gmail.com
              </a>
              <span className="hidden sm:inline text-gray-400">•</span>
              <a
                href="tel:+46762572066"
                className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline font-medium"
              >
                <Phone className="h-4 w-4" />
                076-257 20 66
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {tr('refreshButton')}
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-2 border-gray-300 hover:bg-gray-100 font-medium py-2 px-6 rounded-lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('navigation.logout')}
            </Button>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-400 mt-8">
            {tr('footer')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}