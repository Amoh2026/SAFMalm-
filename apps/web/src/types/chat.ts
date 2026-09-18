// ============================================================
// Chat Types — SAFiMalmo
// ============================================================
// All chat-related TypeScript types.
// Matches the shape stored in Firestore.
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
// Chat room document: chatRooms/{roomId}
// ------------------------------------------------------------
export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  createdBy: string;            // Firebase Auth uid
  createdByName: string;        // Display name snapshot
  createdAt: Timestamp | null;
  members: ChatMember[];        // Max 15
  isActive: boolean;
  memberCount: number;          // Denormalized for quick display
  lastMessageAt?: Timestamp | null;
  lastMessagePreview?: string;  // Denormalized preview
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
  createdAt: Timestamp | null;    // For ordering
  expiresAt: Timestamp | null;    // Firestore TTL field — auto-deleted after 6 months
}

// Payload used when sending a message
export interface ChatMessageInput {
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  type?: ChatMessageType;
  attachments?: ChatAttachment[];
}

// ------------------------------------------------------------
// Presence document: chatPresence/{roomId}_{userId}
// ------------------------------------------------------------
export type PresenceState = 'online' | 'away';

export interface ChatPresence {
  docId: string;          // `${roomId}_${userId}`
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
export const MAX_ROOM_MEMBERS = 15;
export const MAX_MESSAGE_LENGTH = 2000;
export const CHAT_TTL_MS = 1000 * 60 * 60 * 24 * 182; // ~6 months

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
export function presenceDocId(roomId: string, userId: string): string {
  return `${roomId}_${userId}`;
}

export function isRoomFull(room: ChatRoom | null): boolean {
  if (!room) return false;
  return room.members.length >= MAX_ROOM_MEMBERS;
}

export function isUserInRoom(room: ChatRoom | null, userId: string | undefined): boolean {
  if (!room || !userId) return false;
  return room.members.some((m) => m.id === userId);
}