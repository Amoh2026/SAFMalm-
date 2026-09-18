'use client';

// ============================================================
// SidebarChatList — nested list of user's chat rooms for the sidebar
// Shows "Mina rum" (owned) and "Medlem i" (member) sections.
// ============================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessagesSquare,
  Lock,
  Crown,
  User as UserIcon,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useChatSidebar } from '@/hooks/useChatSidebar';
import { PendingBadge } from './PendingBadge';

interface Props {
  userId: string | undefined;
  onNavigate?: () => void;
}

export function SidebarChatList({ userId, onNavigate }: Props) {
  const pathname = usePathname();
  const { ownedRooms, memberRooms, loading, totalPending } = useChatSidebar(userId);

  if (!userId) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-blue-100">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>...</span>
      </div>
    );
  }

  const hasAny = ownedRooms.length > 0 || memberRooms.length > 0;

  return (
    <div className="mt-1 ml-2 pl-3 border-l-2 border-blue-700 space-y-0.5">
      {/* All rooms link */}
      <Link
        href="/member/chat"
        onClick={onNavigate}
        className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition ${
          pathname === '/member/chat'
            ? 'bg-yellow-500 text-blue-900 font-medium'
            : 'text-blue-100 hover:bg-blue-800'
        }`}
      >
        <MessagesSquare className="h-3.5 w-3.5" />
        <span>Alla rum</span>
        {totalPending > 0 && (
          <PendingBadge count={totalPending} className="ml-auto" />
        )}
      </Link>

      {/* Owned rooms */}
      {ownedRooms.length > 0 && (
        <>
          <p className="text-[9px] font-semibold text-blue-300 uppercase tracking-wider pt-2 px-2">
            Mina rum
          </p>
          {ownedRooms.slice(0, 10).map((r) => {
            const isActive = pathname === `/member/chat/${r.id}`;
            const pendingCount = (r.pendingRequests ?? []).length;
            return (
              <Link
                key={r.id}
                href={`/member/chat/${r.id}`}
                onClick={onNavigate}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition ${
                  isActive
                    ? 'bg-yellow-500 text-blue-900 font-medium'
                    : 'text-blue-100 hover:bg-blue-800'
                }`}
              >
                {r.requiresApproval ? (
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <MessagesSquare className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="truncate flex-1">{r.name}</span>
                <Crown className="h-3 w-3 text-yellow-400 shrink-0" />
                {pendingCount > 0 && (
                  <PendingBadge count={pendingCount} />
                )}
              </Link>
            );
          })}
        </>
      )}

      {/* Member rooms */}
      {memberRooms.length > 0 && (
        <>
          <p className="text-[9px] font-semibold text-blue-300 uppercase tracking-wider pt-2 px-2">
            Medlem i
          </p>
          {memberRooms.slice(0, 10).map((r) => {
            const isActive = pathname === `/member/chat/${r.id}`;
            return (
              <Link
                key={r.id}
                href={`/member/chat/${r.id}`}
                onClick={onNavigate}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition ${
                  isActive
                    ? 'bg-yellow-500 text-blue-900 font-medium'
                    : 'text-blue-100 hover:bg-blue-800'
                }`}
              >
                {r.requiresApproval ? (
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <MessagesSquare className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="truncate flex-1">{r.name}</span>
                <UserIcon className="h-3 w-3 text-blue-300 shrink-0" />
              </Link>
            );
          })}
        </>
      )}

      {!hasAny && (
        <p className="text-[10px] text-blue-300 italic px-2 py-1">
          Inga rum ännu
        </p>
      )}
    </div>
  );
}
