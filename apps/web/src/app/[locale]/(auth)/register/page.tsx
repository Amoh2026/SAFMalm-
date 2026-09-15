"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/providers/LanguageProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t, locale } = useLanguage();

  const tr = (key: string) => t(`register.${key}`);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(tr('passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      setError(tr('passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      const result = await register(email, password, name);

      if (result.success) {
        setSuccess(true);
        // ✅ Redirect to /pending instead of /member/dashboard
        const pendingPath = locale === 'sv' ? '/pending' : `/${locale}/pending`;
        setTimeout(() => {
          router.push(pendingPath);
        }, 1500);
      } else {
        let errorKey = 'somethingWentWrong';
        if (result.error?.toLowerCase().includes('already in use')) errorKey = 'emailInUse';
        else if (result.error?.toLowerCase().includes('weak')) errorKey = 'weakPassword';
        else if (result.error?.toLowerCase().includes('invalid email')) errorKey = 'invalidEmail';
        setError(tr(errorKey));
      }
    } catch {
      setError(tr('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full border-2 border-green-500">
          <CardContent className="pt-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">{tr('successTitle')}</h2>
            <p className="text-gray-600">{tr('successMessage')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex">
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full">

        {/* Left Side - Image */}
        <div className="hidden lg:flex flex-col h-screen sticky top-0 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
          <div className="flex-shrink-0 px-8 pt-10 pb-4 text-center">
            <h3 className="text-white font-bold text-xl leading-tight mb-2">
              {t('login.imageQuote')}
            </h3>
            <p className="text-blue-200/80 text-sm leading-relaxed max-w-sm mx-auto">
              {t('login.imageQuoteDesc')}
            </p>
          </div>

          <div className="flex-1 relative min-h-0">
            <Image
              src="/images/login.png"
              alt="Svensk Algeriska Föreningen"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain"
              priority
            />
          </div>

          <div className="flex-shrink-0 px-8 pb-10 pt-4 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-blue-200/80 text-sm leading-relaxed max-w-sm mx-auto">
                <span className="text-yellow-300 font-semibold">{t('login.togetherLabel')}</span>{' '}
                {t('login.togetherText')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-12 w-full">
          <div className="w-full max-w-md">

            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                {tr('title')}
              </div>
            </div>

            <Card className="border-2 border-blue-400 shadow-lg w-full">
              <CardHeader className="border-b-2 border-blue-400 pb-4">
                <CardTitle className="text-2xl text-center text-blue-900">
                  {tr('title')}
                </CardTitle>
                <p className="text-sm text-gray-500 text-center mt-2">
                  {tr('subtitle')}
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tr('nameLabel')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder={tr('namePlaceholder')}
                        disabled={loading}
                        className="pl-10 border-2 border-blue-400 focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tr('emailLabel')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder={tr('emailPlaceholder')}
                        disabled={loading}
                        className="pl-10 border-2 border-blue-400 focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tr('passwordLabel')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder={tr('passwordPlaceholder')}
                        disabled={loading}
                        className="pl-10 pr-10 border-2 border-blue-400 focus:border-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tr('repeatPasswordLabel')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder={tr('repeatPasswordPlaceholder')}
                        disabled={loading}
                        className="pl-10 pr-10 border-2 border-blue-400 focus:border-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition"
                    disabled={loading}
                  >
                    {loading ? tr('registering') : tr('registerButton')}
                  </Button>

                  <p className="text-center text-sm text-gray-600 mt-4">
                    {tr('alreadyMember')}{' '}
                    <Link
                      href={`/${locale}/login`}
                      className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      {tr('loginLink')}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}