'use client';

// ============================================================
// PendingBadge — small red badge showing pending request count
// ============================================================

interface Props {
  count: number;
  className?: string;
  /** Show max cap (e.g. "9+") */
  cap?: number;
}

export function PendingBadge({ count, className = '', cap = 99 }: Props) {
  if (!count || count <= 0) return null;
  const display = count > cap ? `${cap}+` : String(count);

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full ${className}`}
      aria-label={`${count} pending requests`}
    >
      {display}
    </span>
  );
}