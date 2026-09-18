// ============================================================
// Firestore TTL helper — 6-month retention for chat messages
// ============================================================
// Every chat message is written with an `expiresAt` Timestamp.
// Firestore's TTL policy auto-deletes documents whose `expiresAt`
// is in the past. No cron jobs needed.
//
// Setup in Firebase Console → Firestore → TTL:
//   Collection group: messages
//   Field: expiresAt
// ============================================================

import { Timestamp } from 'firebase/firestore';
import { CHAT_TTL_MS } from '@/types/chat';

export function computeExpiresAt(fromMs: number = Date.now()): Timestamp {
  return Timestamp.fromMillis(fromMs + CHAT_TTL_MS);
}

export function computeExpiresAtFromDate(date: Date): Timestamp {
  return Timestamp.fromMillis(date.getTime() + CHAT_TTL_MS);
}

export function isExpired(expiresAt: Timestamp | null | undefined): boolean {
  if (!expiresAt) return false;
  return expiresAt.toMillis() < Date.now();
}