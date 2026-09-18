'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  CalendarCheck,
  Mail,
  Settings,
  LogOut,
  Shield,
  ClipboardList,
  MessageSquare,
  MessagesSquare,
  Image as ImageIcon,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Home,
  User,
} from 'lucide-react';

export function AppSidebar() {
  const pathname = usePathname();
  const { logout, isAdmin } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Auto-open the Members dropdown when on a member page (for admins)
  useEffect(() => {
    if (isAdmin && pathname?.startsWith('/member')) {
      setMembersOpen(true);
    }
  }, [pathname, isAdmin]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const isActive = (path: string, exact = false) => {
    if (exact) return pathname === path;
    return pathname === path || pathname?.startsWith(path + '/');
  };

  // Admin menu items
  const adminItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/members', label: 'Medlemmar', icon: Users, exact: true },
    { href: '/admin/members/applications', label: 'Ansökningar', icon: ClipboardList },
    { href: '/admin/bookings', label: 'Bokningar', icon: CalendarCheck },
    { href: '/admin/events', label: 'Evenemang', icon: Calendar },
    { href: '/admin/posts', label: 'Inlägg', icon: FileText },
    { href: '/admin/files', label: 'Filer', icon: ImageIcon },
    { href: '/admin/culture-media', label: 'Kulturmedia', icon: ImageIcon },
    { href: '/admin/messages', label: 'Meddelanden', icon: MessageSquare },
    { href: '/admin/settings', label: 'Inställningar', icon: Settings },
  ];

  // Member menu items — used both in the member sidebar and in the admin dropdown
  const memberItems = [
    { href: '/member/dashboard', label: 'Hem', icon: Home },
    { href: '/member/chat', label: 'Chatt', icon: MessagesSquare },
    { href: '/member/boka', label: 'Boka lokal', icon: CalendarCheck },
    { href: '/member/contact', label: 'Meddelanden', icon: MessageSquare },
    { href: '/member/profile', label: 'Min profil', icon: User },
    { href: '/member/settings', label: 'Inställningar', icon: Settings },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-4 right-4 z-50 md:hidden bg-blue-900 text-white p-3 rounded-full shadow-lg hover:bg-blue-800 transition"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-blue-900 text-white transition-all duration-300 z-40 shadow-xl ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
        } md:translate-x-0 md:w-64 shrink-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-blue-800">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-yellow-400" />
              <div>
                <h1 className="text-xl font-bold">
                  {isAdmin ? 'Admin Panel' : 'Medlemsportal'}
                </h1>
                <p className="text-xs text-yellow-400">Svensk Algeriska Föreningen</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {isAdmin ? (
              <>
                {/* Admin menu items */}
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                        active
                          ? 'bg-yellow-500 text-blue-900 font-medium shadow-lg'
                          : 'text-white hover:bg-blue-800'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-blue-900' : ''}`} />
                      <span>{item.label}</span>
                      {active && (
                        <span className="ml-auto text-xs bg-blue-900 text-yellow-400 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </Link>
                  );
                })}

                {/* Divider */}
                <div className="my-3 border-t border-blue-800" />

                {/* Members dropdown (admin only) */}
                <div>
                  <button
                    onClick={() => setMembersOpen(!membersOpen)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      pathname?.startsWith('/member')
                        ? 'bg-blue-800 text-yellow-400'
                        : 'text-white hover:bg-blue-800'
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    <span>Members</span>
                    <span className="ml-auto">
                      {membersOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                  </button>

                  {membersOpen && (
                    <div className="mt-1 ml-2 pl-3 border-l-2 border-blue-700 space-y-1">
                      {memberItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm ${
                              active
                                ? 'bg-yellow-500 text-blue-900 font-medium'
                                : 'text-blue-100 hover:bg-blue-800'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Member — just the member menu items */
              memberItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      active
                        ? 'bg-yellow-500 text-blue-900 font-medium shadow-lg'
                        : 'text-white hover:bg-blue-800'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-blue-900' : ''}`} />
                    <span>{item.label}</span>
                    {active && (
                      <span className="ml-auto text-xs bg-blue-900 text-yellow-400 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-blue-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-blue-800 rounded-lg transition"
            >
              <LogOut className="h-4 w-4" />
              Logga ut
            </button>
          </div>
        </div>
      </div>
    </>
  );
}