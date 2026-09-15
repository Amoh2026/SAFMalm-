// src/components/public/MemberNavbar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Home, Calendar, User, Settings, BookOpen, Shield, LayoutDashboard } from 'lucide-react';

export function MemberNavbar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const navItems = [
    { href: '/member/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/member/dashboard/boka', label: 'Boka', icon: BookOpen },
    { href: '/member/contact', label: 'Kontakt', icon: Home },
    { href: '/member/profile', label: 'Profil', icon: User },
    { href: '/member/settings', label: 'Inställningar', icon: Settings },
  ];

  return (
    <nav className="bg-blue-900 border-b-4 border-yellow-500 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/member/dashboard" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-blue-900 font-bold text-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'M'}
            </div>
            <div>
              <span className="text-white font-bold text-lg leading-tight">Medlemsportal</span>
              <span className="text-yellow-400 text-xs block">{user?.name || 'Medlem'}</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 transition font-medium ${
                    active
                      ? 'text-yellow-400 border-b-2 border-yellow-400 pb-1'
                      : 'text-white hover:text-yellow-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Admin link - only for admins */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-2 font-bold px-4 py-2 rounded-lg transition ${
                  pathname?.startsWith('/admin')
                    ? 'bg-yellow-500 text-blue-900 shadow-lg ring-2 ring-yellow-300'
                    : 'bg-yellow-500 text-blue-900 hover:bg-yellow-400'
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-white hover:text-yellow-400 transition px-3 py-2 rounded-lg hover:bg-blue-800"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Logga ut</span>
            </button>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="text-white hover:text-yellow-400 transition p-2"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}