// ============================================================
// Chat Types — SAFiMalmo
// v3 — added SharedDocument for in-call document sharing
// ============================================================

import { Timestamp } from 'firebase/firestore';

export interface ChatMember {
  id: string;
  name: string;
  email?: string;
  joinedAt: number;
}

export interface PendingRequest {
  id: string;
  name: string;
  email?: string;
  requestedAt: number;
  message?: string;
}

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
}

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

export type PresenceState = 'online' | 'away';

export interface ChatPresence {
  docId: string;
  roomId: string;
  userId: string;
  userName: string;
  state: PresenceState;
  lastSeen: Timestamp | null;
}

// v3 — Shared documents
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

export interface LiveKitTokenResponse {
  token: string;
  url: string;
  roomName: string;
  identity: string;
}

export const MAX_ROOM_MEMBERS = 15;
export const MIN_ROOM_MEMBERS = 2;
export const ALLOWED_MAX_MEMBERS = [3, 4, 7, 15] as const;
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_REQUEST_MESSAGE_LENGTH = 200;
export const MAX_SHARED_FILE_SIZE = 10 * 1024 * 1024;
export const CHAT_TTL_MS = 1000 * 60 * 60 * 24 * 182;

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
  };
}

export function formatFileSize(bytes: number | undefined): string {
  if (!bytes || bytes <= 0) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}