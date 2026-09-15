'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Shield, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/providers/LanguageProvider';
import LanguageSwitcher from './LanguageSwitcher';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, isAdmin, isApproved } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { locale, t } = useLanguage();

  const isAuthenticated = !loading && user !== null;
  const canAccessMember = isApproved || isAdmin;

  const getActualHref = (path: string) => {
    if (path.startsWith('/admin') || path.startsWith('/member')) return path;
    const currentLocale = locale || 'sv';
    if (path === '/') return `/${currentLocale}`;
    return `/${currentLocale}${path}`;
  };

  const isActivePath = (href: string) => {
    if (!pathname) return false;
    let currentPath = pathname;
    const validLocales = ['sv', 'en', 'ar', 'fr'];
    for (const loc of validLocales) {
      if (currentPath === `/${loc}` || currentPath.startsWith(`/${loc}/`)) {
        currentPath = currentPath.replace(`/${loc}`, '') || '/';
        break;
      }
    }
    let targetPath = href;
    for (const loc of validLocales) {
      if (targetPath === `/${loc}` || targetPath.startsWith(`/${loc}/`)) {
        targetPath = targetPath.replace(`/${loc}`, '') || '/';
        break;
      }
    }
    if (targetPath === '/') return currentPath === '/';
    return currentPath === targetPath;
  };

  const navItems = [
    { href: '/', label: t('navigation.home') },
    { href: '/about', label: t('navigation.about') },
    { href: '/evenemang', label: t('navigation.events') },
    { href: '/culture', label: t('navigation.culture') },
    { href: '/contact', label: t('navigation.contact') },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-blue-900 border-b-4 border-yellow-500 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top row — logo + hamburger */}
        <div className="flex items-center justify-between py-3 gap-2">
          {/* Logo */}
          <Link
            href={getActualHref('/')}
            className="flex items-center gap-2 hover:opacity-80 transition shrink-0 min-w-0"
          >
            <img
              src="/images/svensk-algeriska-foreningen-logo.png"
              alt={t('navigation.home')}
              className="h-9 sm:h-10 w-auto shrink-0"
            />
            <div className="hidden lg:block leading-tight">
              <span className="text-white font-bold text-base xl:text-lg whitespace-nowrap">
                Svensk Algeriska Föreningen
              </span>
              <span
                className="text-yellow-400 text-xs block whitespace-nowrap"
                style={{
                  fontFamily:
                    '"Traditional Arabic", "Arabic Typesetting", Arial, sans-serif',
                }}
              >
                الجمعية الجزائرية السويدية
              </span>
            </div>
          </Link>

          {/* Desktop Navigation — hidden below xl */}
          <div className="hidden xl:flex items-center gap-2 2xl:gap-4 min-w-0 flex-shrink">
            {navItems.map((item) => {
              const active = isActivePath(item.href);
              const href = getActualHref(item.href);
              return (
                <Link
                  key={item.href}
                  href={href}
                  className={`transition font-medium text-sm 2xl:text-base whitespace-nowrap ${
                    active
                      ? 'text-yellow-400 border-b-2 border-yellow-400 pb-1'
                      : 'text-white hover:text-yellow-400'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Nya i Sverige — only at 2xl */}
            <Link
              href={getActualHref('/nya-i-sverige')}
              className={`hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all duration-200 whitespace-nowrap ${
                isActivePath('/nya-i-sverige')
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                  : 'bg-emerald-700/20 border-emerald-400/60 text-emerald-100 hover:bg-emerald-600 hover:border-emerald-400 hover:text-white hover:shadow-md'
              }`}
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-white/30 bg-white shrink-0">
                <img
                  src="/images/liaison.png"
                  alt="Algeria & Sweden"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-semibold text-sm">
                {t('navigation.newInSweden')}
              </span>
            </Link>

            {canAccessMember && (
              <Link
                href="/member/dashboard"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm transition whitespace-nowrap ${
                  pathname?.startsWith('/member')
                    ? 'bg-yellow-500 text-blue-900 border-2 border-yellow-400'
                    : 'bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-400 hover:border-yellow-400'
                }`}
              >
                <Users className="h-4 w-4" />
                <span className="hidden 2xl:inline">Members</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 font-bold px-3 py-2 rounded-lg text-sm transition whitespace-nowrap ${
                  pathname?.startsWith('/admin')
                    ? 'bg-yellow-500 text-blue-900 shadow-lg ring-2 ring-yellow-300'
                    : 'bg-yellow-500 text-blue-900 hover:bg-yellow-400'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span className="hidden 2xl:inline">{t('navigation.admin')}</span>
              </Link>
            )}

            <LanguageSwitcher />

            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href={getActualHref('/login')}
                  className={`transition font-medium text-sm whitespace-nowrap ${
                    isActivePath('/login')
                      ? 'text-yellow-400 border-b-2 border-yellow-400 pb-1'
                      : 'text-white hover:text-yellow-400'
                  }`}
                >
                  {t('navigation.login')}
                </Link>
                <Link
                  href={getActualHref('/medlemsregistrering')}
                  className={`font-bold px-4 py-2 rounded-lg text-sm transition whitespace-nowrap ${
                    isActivePath('/medlemsregistrering')
                      ? 'bg-yellow-400 text-blue-900 shadow-lg ring-2 ring-yellow-300'
                      : 'bg-yellow-500 text-blue-900 hover:bg-yellow-400'
                  }`}
                >
                  {t('navigation.membership')}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-white text-sm hidden 2xl:block whitespace-nowrap max-w-[140px] truncate">
                  {user?.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white hover:text-blue-800 whitespace-nowrap"
                  onClick={handleLogout}
                >
                  {t('navigation.logout')}
                </Button>
              </div>
            )}
          </div>

          {/* Hamburger — visible below xl */}
          <button
            className="xl:hidden text-white hover:text-yellow-400 transition p-2 shrink-0"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile / tablet menu — below xl */}
        {isOpen && (
          <div className="xl:hidden py-4 border-t border-blue-800">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => {
                const active = isActivePath(item.href);
                const href = getActualHref(item.href);
                return (
                  <Link
                    key={item.href}
                    href={href}
                    className={`transition font-medium py-2 px-3 rounded-lg ${
                      active
                        ? 'text-yellow-400 bg-blue-800 border-l-4 border-yellow-500'
                        : 'text-white hover:text-yellow-400 hover:bg-blue-800'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href={getActualHref('/nya-i-sverige')}
                className={`flex items-center gap-3 py-2 px-3 rounded-lg transition ${
                  isActivePath('/nya-i-sverige')
                    ? 'bg-emerald-700/50 text-emerald-100 border-l-4 border-emerald-400'
                    : 'text-emerald-100 hover:bg-emerald-700/30'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 bg-white shrink-0">
                  <img
                    src="/images/liaison.png"
                    alt="Algeria & Sweden"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-semibold">
                  {t('navigation.newInSweden')}
                </span>
              </Link>

              {canAccessMember && (
                <Link
                  href="/member/dashboard"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg transition ${
                    pathname?.startsWith('/member')
                      ? 'bg-blue-800 text-yellow-400 border-l-4 border-yellow-500'
                      : 'text-white hover:bg-blue-800'
                  }`}
                >
                  <Users className="h-5 w-5 text-yellow-400" />
                  <span>Members</span>
                </Link>
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`flex items-center justify-center gap-2 font-bold px-4 py-2 rounded-lg transition ${
                    pathname?.startsWith('/admin')
                      ? 'bg-yellow-400 text-blue-900 shadow-lg ring-2 ring-yellow-300'
                      : 'bg-yellow-500 text-blue-900 hover:bg-yellow-400'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  {t('navigation.admin')}
                </Link>
              )}

              <div className="pt-2 border-t border-blue-800">
                <div className="flex items-center justify-between py-2 px-3">
                  <span className="text-white text-sm">
                    {t('navigation.language')}
                  </span>
                  <LanguageSwitcher />
                </div>
              </div>

              {!isAuthenticated ? (
                <div className="pt-2 border-t border-blue-800 flex flex-col gap-2">
                  <Link
                    href={getActualHref('/login')}
                    className={`py-2 px-3 rounded-lg transition ${
                      isActivePath('/login')
                        ? 'text-yellow-400 bg-blue-800 border-l-4 border-yellow-500'
                        : 'text-white hover:text-yellow-400 hover:bg-blue-800'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {t('navigation.login')}
                  </Link>
                  <Link
                    href={getActualHref('/medlemsregistrering')}
                    className={`font-bold px-5 py-2 rounded-lg text-center transition ${
                      isActivePath('/medlemsregistrering')
                        ? 'bg-yellow-400 text-blue-900 shadow-lg ring-2 ring-yellow-300'
                        : 'bg-yellow-500 text-blue-900 hover:bg-yellow-400'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {t('navigation.membership')}
                  </Link>
                </div>
              ) : (
                <div className="pt-2 border-t border-blue-800">
                  <p className="text-white text-sm py-1 px-3">
                    {t('navigation.loggedInAs')} {user?.name}
                  </p>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="text-white hover:text-yellow-400 py-2 px-3 w-full text-left rounded-lg hover:bg-blue-800 transition"
                  >
                    {t('navigation.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;