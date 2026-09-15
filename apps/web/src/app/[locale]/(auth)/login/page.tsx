"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/providers/LanguageProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Users, Heart, Handshake, Globe, Target, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const { t, locale } = useLanguage();

  const tr = (key: string) => t(`login.${key}`);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

   useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (user.approved) {
        router.push('/member/dashboard');
      } else {
        router.push('/pending');
      }
    }
  }, [user, router]);

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{tr('redirecting')}</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || tr('invalidCredentials'));
      }
    } catch {
      setError(tr('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex">
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full">

        {/* Left Side - Image with text on top and bottom */}
        <div className="hidden lg:flex flex-col h-screen sticky top-0 bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">

          {/* TEXT AT THE TOP OF THE IMAGE AREA */}
          <div className="flex-shrink-0 px-8 pt-10 pb-4 text-center">
            <h3 className="text-white font-bold text-xl leading-tight mb-2">
              {tr('imageQuote')}
            </h3>
            <p className="text-blue-200/80 text-sm leading-relaxed max-w-sm mx-auto">
              {tr('imageQuoteDesc')}
            </p>
          </div>

          {/* IMAGE IN THE MIDDLE */}
          <div className="flex-1 relative min-h-0">
            <Image
              src="/images/login.png"
              alt="Svensk Algeriska Föreningen"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* TEXT AT THE BOTTOM OF THE IMAGE AREA */}
          <div className="flex-shrink-0 px-8 pb-10 pt-4 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-blue-200/80 text-sm leading-relaxed max-w-sm mx-auto">
                <span className="text-yellow-300 font-semibold">{tr('togetherLabel')}</span>{' '}
                {tr('togetherText')}
              </p>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-blue-300/60">
                <span>{tr('flagSweden')}</span>
                <span className="text-yellow-500">•</span>
                <span>{tr('flagAlgeria')}</span>
                <span className="text-yellow-500">•</span>
                <span>{tr('flagMalmo')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Image - full banner */}
        <div className="relative lg:hidden w-full bg-blue-900">
          <Image
            src="/images/login.png"
            alt="Svensk Algeriska Föreningen"
            width={1200}
            height={800}
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        {/* Right Side - Welcome Text + Login Form */}
        <div className="flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-12 w-full">
          <div className="w-full max-w-md">

            {/* Welcome Section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-blue-900 mb-2">
                {tr('welcomeTitle')}
              </h2>
              <p className="text-lg text-blue-700 mb-6">
                {tr('welcomeSubtitle')}
              </p>

              {/* Benefits list */}
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <Users className="h-5 w-5 text-yellow-500 shrink-0" />
                  <span className="text-sm text-gray-700">{tr('benefit1')}</span>
                </div>
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <Heart className="h-5 w-5 text-yellow-500 shrink-0" />
                  <span className="text-sm text-gray-700">{tr('benefit2')}</span>
                </div>
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <Handshake className="h-5 w-5 text-yellow-500 shrink-0" />
                  <span className="text-sm text-gray-700">{tr('benefit3')}</span>
                </div>
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 p-3 rounded-lg">
                  <Globe className="h-5 w-5 text-green-600 shrink-0" />
                  <span className="text-sm text-gray-700">{tr('benefit4')}</span>
                </div>
                <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 p-3 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600 shrink-0" />
                  <span className="text-sm text-gray-700">{tr('benefit5')}</span>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <Card className="border-2 border-blue-400 shadow-lg w-full">
              <CardHeader className="border-b-2 border-blue-400 pb-4">
                <CardTitle className="text-2xl text-center text-blue-900">
                  {tr('loginTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {tr('emailLabel')}
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder={tr('emailPlaceholder')}
                      disabled={loading}
                      className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {tr('passwordLabel')}
                      </label>
                      <Link
                        href={`/${locale}/glomt-losenord`}
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        {tr('forgotPassword')}
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder={tr('passwordPlaceholder')}
                        disabled={loading}
                        className="border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition pr-10"
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
                    {loading ? tr('loggingIn') : tr('loginButton')}
                  </Button>

                  <p className="text-center text-sm text-gray-600 mt-4">
                    {tr('notMember')}{' '}
                    <Link
                      href={`/${locale}/register`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {tr('registerLink')}
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Call to action - Join us */}
            <div className="mt-6 text-center">
              <Link
                href={`/${locale}/register`}
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                <Sparkles className="h-4 w-4" />
                {tr('discoverBenefits')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}