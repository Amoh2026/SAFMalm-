"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslation';

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || 'sv';
  const loginHref = `/${locale}/login`;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError(t('forgotPassword.tooManyAttempts'));
        } else {
          setError(data.message || t('forgotPassword.errorMessage'));
        }
        return;
      }

      setSent(true);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(t('forgotPassword.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">
              {t('forgotPassword.successTitle')}
            </h2>
            <p className="text-muted-foreground">
              {t('forgotPassword.successMessage')}
            </p>
            <Button asChild variant="outline">
              <Link href={loginHref}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('forgotPassword.backToLogin')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {t('forgotPassword.title')}
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {t('forgotPassword.subtitle')}
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('forgotPassword.emailLabel')}{' '}
                <span className="text-red-500">*</span>
              </label>
              <Input
                required
                type="email"
                placeholder={t('forgotPassword.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('forgotPassword.submittingButton')}
                </>
              ) : (
                t('forgotPassword.submitButton')
              )}
            </Button>

            <p className="text-center text-sm">
              <Link
                href={loginHref}
                className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('forgotPassword.backToLogin')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}