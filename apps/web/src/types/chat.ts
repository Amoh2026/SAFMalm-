// ============================================================
// Chat Types — SAFiMalmo
// ============================================================
// All chat-related TypeScript types.
// Matches the shape stored in Firestore.
//
// v2 — added: maxMembers, requiresApproval, pendingRequests,
//              roomType, request message support
// ============================================================

import { Timestamp } from 'firebase/firestore';

// ------------------------------------------------------------
// Chat member (stored inside chatRooms/{id}.members[])
// ------------------------------------------------------------
export interface ChatMember {
  id: string;          // Firebase Auth uid
  name: string;        // Display name
  email?: string;      // Optional — for admin queries
  joinedAt: number;    // Date.now()
}

// ------------------------------------------------------------
// Pending join request (stored in chatRooms/{id}.pendingRequests[])
// ------------------------------------------------------------
export interface PendingRequest {
  id: string;          // Firebase Auth uid
  name: string;        // Display name
  email?: string;      // Optional
  requestedAt: number; // Date.now()
  message?: string;    // Optional reason (max 200 chars)
}

// ------------------------------------------------------------
// Chat room document: chatRooms/{roomId}
// ------------------------------------------------------------
export type RoomType = 'public' | 'private';

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  createdBy: string;            // Firebase Auth uid (owner)
  createdByName: string;        // Display name snapshot
  createdAt: Timestamp | null;
  members: ChatMember[];        // Max = maxMembers
  isActive: boolean;
  memberCount: number;          // Denormalized for quick display

  // v2 fields
  maxMembers: number;           // 3, 4, 7, or 15
  requiresApproval: boolean;    // true = private, false = public
  pendingRequests: PendingRequest[];

  // Denormalized preview
  lastMessageAt?: Timestamp | null;
  lastMessagePreview?: string;
}

// ------------------------------------------------------------
// Message document: chatRooms/{roomId}/messages/{messageId}
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
  expiresAt: Timestamp | null;  // Firestore TTL
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
// Presence: chatPresence/{roomId}_{userId}
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
// LiveKit token response
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
export const MAX_ROOM_MEMBERS = 15;          // Absolute ceiling
export const MIN_ROOM_MEMBERS = 2;           // Absolute floor
export const ALLOWED_MAX_MEMBERS = [3, 4, 7, 15] as const;
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_REQUEST_MESSAGE_LENGTH = 200;
export const CHAT_TTL_MS = 1000 * 60 * 60 * 24 * 182; // ~6 months

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

// Backward compatibility — old rooms without new fields
export function normalizeRoom(raw: any): ChatRoom {
  return {
    ...raw,
    maxMembers: raw.maxMembers ?? MAX_ROOM_MEMBERS,
    requiresApproval: raw.requiresApproval ?? false,
    pendingRequests: raw.pendingRequests ?? [],
  };
}