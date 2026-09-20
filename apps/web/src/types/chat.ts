// ============================================================
// Chat Types — SAFiMalmo
// ============================================================
// v4 — added room session tracking for private room visibility
// ============================================================

import { Timestamp } from 'firebase/firestore';

// ------------------------------------------------------------
// Chat member
// ------------------------------------------------------------
export interface ChatMember {
  id: string;
  name: string;
  email?: string;
  joinedAt: number;
}

// ------------------------------------------------------------
// Pending join request
// ------------------------------------------------------------
export interface PendingRequest {
  id: string;
  name: string;
  email?: string;
  requestedAt: number;
  message?: string;
}

// ------------------------------------------------------------
// Chat room
// ------------------------------------------------------------
export type RoomType = 'public' | 'private';

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp | null;
  members: ChatMember[];
  isActive: boolean;
  memberCount: number;
  maxMembers: number;
  requiresApproval: boolean;
  pendingRequests: PendingRequest[];
  lastMessageAt?: Timestamp | null;
  lastMessagePreview?: string;

  // v4 — session tracking (for private room visibility)
  ownerIsActive?: boolean;           // owner is on the room page
  ownerLastActiveAt?: Timestamp | null; // heartbeat for stale detection
  sessionOccupants?: string[];       // UIDs currently viewing the room
}

// ------------------------------------------------------------
// Chat message
// ------------------------------------------------------------
export type ChatMessageType = 'text' | 'system' | 'file';

export interface ChatAttachment {
  url: string;
  name: string;
  size: number;
  mime: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  type: ChatMessageType;
  attachments?: ChatAttachment[];
  createdAt: Timestamp | null;
  expiresAt: Timestamp | null;
}

export interface ChatMessageInput {
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  type?: ChatMessageType;
  attachments?: ChatAttachment[];
}

// ------------------------------------------------------------
// Presence
// ------------------------------------------------------------
export type PresenceState = 'online' | 'away';

export interface ChatPresence {
  docId: string;
  roomId: string;
  userId: string;
  userName: string;
  state: PresenceState;
  lastSeen: Timestamp | null;
}

// ------------------------------------------------------------
// v3 — Shared documents
// ------------------------------------------------------------
export type SharedDocSource = 'upload' | 'drive' | 'dropbox' | 'youtube' | 'link';
export type SharedDocKind = 'pdf' | 'image' | 'video' | 'embed' | 'download';

export interface SharedDocument {
  id: string;
  roomId: string;
  sharedBy: string;
  sharedByName: string;
  sharedAt: Timestamp | null;
  source: SharedDocSource;
  kind: SharedDocKind;
  title: string;
  mimeType?: string;
  fileSize?: number;
  originalUrl?: string;
  embedUrl: string;
  downloadUrl?: string;
  isActive: boolean;
}

export interface SharedDocumentInput {
  source: SharedDocSource;
  kind: SharedDocKind;
  title: string;
  mimeType?: string;
  fileSize?: number;
  originalUrl?: string;
  embedUrl: string;
  downloadUrl?: string;
}

// ------------------------------------------------------------
// LiveKit token
// ------------------------------------------------------------
export interface LiveKitTokenResponse {
  token: string;
  url: string;
  roomName: string;
  identity: string;
}

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------
export const MAX_ROOM_MEMBERS = 15;
export const MIN_ROOM_MEMBERS = 2;
export const ALLOWED_MAX_MEMBERS = [3, 4, 7, 15] as const;
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_REQUEST_MESSAGE_LENGTH = 200;
export const MAX_SHARED_FILE_SIZE = 10 * 1024 * 1024;
export const CHAT_TTL_MS = 1000 * 60 * 60 * 24 * 182;

// v4 — session freshness
export const SESSION_HEARTBEAT_MS = 30_000;      // 30s
export const SESSION_STALE_MS = 90_000;          // 90s

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
export function presenceDocId(roomId: string, userId: string): string {
  return `${roomId}_${userId}`;
}

export function isRoomFull(room: ChatRoom | null): boolean {
  if (!room) return false;
  const max = room.maxMembers ?? MAX_ROOM_MEMBERS;
  return (room.members?.length ?? 0) >= max;
}

export function isUserInRoom(room: ChatRoom | null, userId: string | undefined): boolean {
  if (!room || !userId) return false;
  return (room.members ?? []).some((m) => m.id === userId);
}

export function isUserOwner(room: ChatRoom | null, userId: string | undefined): boolean {
  if (!room || !userId) return false;
  return room.createdBy === userId;
}

export function hasPendingRequest(room: ChatRoom | null, userId: string | undefined): boolean {
  if (!room || !userId) return false;
  return (room.pendingRequests ?? []).some((r) => r.id === userId);
}

export function isPrivateRoom(room: ChatRoom | null): boolean {
  if (!room) return false;
  return room.requiresApproval === true;
}

export function getRoomType(room: ChatRoom | null): RoomType {
  if (!room) return 'public';
  return room.requiresApproval ? 'private' : 'public';
}

export function getPendingCount(room: ChatRoom | null): number {
  if (!room) return 0;
  return (room.pendingRequests ?? []).length;
}

export function normalizeRoom(raw: any): ChatRoom {
  return {
    ...raw,
    maxMembers: raw.maxMembers ?? MAX_ROOM_MEMBERS,
    requiresApproval: raw.requiresApproval ?? false,
    pendingRequests: raw.pendingRequests ?? [],
    ownerIsActive: raw.ownerIsActive ?? false,
    ownerLastActiveAt: raw.ownerLastActiveAt ?? null,
    sessionOccupants: raw.sessionOccupants ?? [],
  };
}

export function formatFileSize(bytes: number | undefined): string {
  if (!bytes || bytes <= 0) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

// ------------------------------------------------------------
// v4 — Room visibility logic
// ------------------------------------------------------------

export type RoomStatus = 'open' | 'locked' | 'dormant' | 'public';

/**
 * Compute the "status" of a room from the viewer's perspective.
 */
export function getRoomStatus(room: ChatRoom | null): RoomStatus {
  if (!room) return 'public';
  if (!room.requiresApproval) return 'public';
  if (isOwnerActive(room)) return 'open';
  if ((room.sessionOccupants?.length ?? 0) > 0) return 'locked';
  return 'dormant';
}

/**
 * Is the owner of this room currently active?
 */
export function isOwnerActive(room: ChatRoom | null): boolean {
  if (!room) return false;
  if (!room.ownerIsActive) return false;
  // Safety: if the heartbeat is stale, treat as inactive
  const last = room.ownerLastActiveAt;
  if (!last) return false;
  const ms = typeof (last as any)?.toMillis === 'function'
    ? (last as any).toMillis()
    : 0;
  if (!ms) return false;
  return Date.now() - ms < SESSION_STALE_MS;
}

/**
 * Can the given user see this room in the list?
 */
export function canSeeRoom(room: ChatRoom | null, currentUserId: string | undefined): boolean {
  if (!room || !currentUserId) return false;

  // 1. Owner always sees their own rooms
  if (room.createdBy === currentUserId) return true;

  // 2. Public rooms: always visible
  if (!room.requiresApproval) return true;

  // 3. Owner is active: visible to all
  if (isOwnerActive(room)) return true;

  // 4. Owner away: visible only to current session occupants
  return (room.sessionOccupants ?? []).includes(currentUserId);
}

export type RoomAccess =
  | { allowed: true }
  | { allowed: false; reason: 'locked' | 'hidden' | 'pending' | 'not-member' };

/**
 * Can the given user enter this room?
 */
export function canEnterRoom(room: ChatRoom | null, currentUserId: string | undefined): RoomAccess {
  if (!room || !currentUserId) return { allowed: false, reason: 'hidden' };

  // Owner: always allowed
  if (room.createdBy === currentUserId) return { allowed: true };

  // Public rooms: always allowed
  if (!room.requiresApproval) return { allowed: true };

  // Owner is active: treat like a private room request flow
  if (isOwnerActive(room)) return { allowed: true };

  // Owner away: only current session occupants can enter
  if ((room.sessionOccupants ?? []).includes(currentUserId)) {
    return { allowed: true };
  }

  // Otherwise: locked / hidden
  return { allowed: false, reason: 'locked' };
}