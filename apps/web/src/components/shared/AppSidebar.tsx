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
import { SidebarChatList } from '@/components/chat/SidebarChatList';
import { useChatSidebar } from '@/hooks/useChatSidebar';
import { PendingBadge } from '@/components/chat/PendingBadge';

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const { totalPending } = useChatSidebar(user?.id);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Auto-open Members dropdown for admins on member pages
  useEffect(() => {
    if (isAdmin && pathname?.startsWith('/member')) {
      setMembersOpen(true);
    }
  }, [pathname, isAdmin]);

  // Auto-open Chat sub-list when on a chat page
  useEffect(() => {
    if (pathname?.startsWith('/member/chat')) {
      setChatOpen(true);
      if (isAdmin) setMembersOpen(true);
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

  // Member menu items (with chat as a special expandable item)
  const memberItems = [
    { href: '/member/dashboard', label: 'Hem', icon: Home },
    { href: '/member/chat', label: 'Chatt', icon: MessagesSquare, expandable: true },
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
                        const isChat = item.href === '/member/chat';
                        const expandable = isChat;

                        return (
                          <div key={item.href}>
                            <div className="flex items-center">
                              <Link
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm flex-1 ${
                                  active && !expandable
                                    ? 'bg-yellow-500 text-blue-900 font-medium'
                                    : 'text-blue-100 hover:bg-blue-800'
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                                <span>{item.label}</span>
                                {isChat && totalPending > 0 && (
                                  <PendingBadge count={totalPending} className="ml-auto" />
                                )}
                              </Link>
                              {expandable && (
                                <button
                                  onClick={() => setChatOpen(!chatOpen)}
                                  className="p-1 rounded hover:bg-blue-800 transition"
                                  aria-label="Toggle chat rooms"
                                >
                                  {chatOpen ? (
                                    <ChevronDown className="h-3 w-3 text-blue-100" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3 text-blue-100" />
                                  )}
                                </button>
                              )}
                            </div>
                            {expandable && chatOpen && (
                              <SidebarChatList
                                userId={user?.id}
                                onNavigate={() => setIsMobileOpen(false)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Member — member menu items with chat as expandable */
              memberItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const isChat = item.href === '/member/chat';

                if (isChat) {
                  return (
                    <div key={item.href}>
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition flex-1 ${
                            active
                              ? 'bg-yellow-500 text-blue-900 font-medium shadow-lg'
                              : 'text-white hover:bg-blue-800'
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${active ? 'text-blue-900' : ''}`} />
                          <span>{item.label}</span>
                          {totalPending > 0 && (
                            <PendingBadge count={totalPending} className="ml-auto" />
                          )}
                        </Link>
                        <button
                          onClick={() => setChatOpen(!chatOpen)}
                          className={`p-2 rounded transition ${
                            active ? 'text-blue-900 hover:bg-yellow-400' : 'text-white hover:bg-blue-800'
                          }`}
                          aria-label="Toggle chat rooms"
                        >
                          {chatOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {chatOpen && (
                        <SidebarChatList
                          userId={user?.id}
                          onNavigate={() => setIsMobileOpen(false)}
                        />
                      )}
                    </div>
                  );
                }

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