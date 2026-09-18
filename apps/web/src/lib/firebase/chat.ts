// ============================================================
// Chat Firestore helpers — uses the existing client.ts db
// ============================================================
// All chat-specific Firestore reads/writes live here.
// Imported by hooks and components.
//
// ⚠️ This file is ADDITIVE — it does not modify client.ts.
// ============================================================

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  where,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase/client';
import { computeExpiresAt } from '@/lib/chat/ttl';
import {
  MAX_MESSAGE_LENGTH,
  presenceDocId,
  type ChatRoom,
  type ChatMessage,
  type ChatMessageInput,
  type ChatPresence,
  type PresenceState,
} from '@/types/chat';

// ------------------------------------------------------------
// Collection / doc references
// ------------------------------------------------------------
export const chatRoomsCol = () => collection(db, 'chatRooms');
export const chatRoomDoc = (roomId: string) => doc(db, 'chatRooms', roomId);
export const chatMessagesCol = (roomId: string) =>
  collection(db, 'chatRooms', roomId, 'messages');
export const chatPresenceDoc = (roomId: string, userId: string) =>
  doc(db, 'chatPresence', presenceDocId(roomId, userId));

// ------------------------------------------------------------
// ROOMS
// ------------------------------------------------------------

/**
 * Fetch a single room by ID.
 */
export async function getRoom(roomId: string): Promise<ChatRoom | null> {
  const snap = await getDoc(chatRoomDoc(roomId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<ChatRoom, 'id'>) };
}

/**
 * Fetch all active rooms (most recently active first).
 * Uses simple query + client-side filter (no composite index needed).
 */
export async function listRooms(max = 50): Promise<ChatRoom[]> {
  const q = query(
    chatRoomsCol(),
    orderBy('createdAt', 'desc'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<ChatRoom, 'id'>) }))
    .filter((r) => r.isActive !== false);
}

/**
 * Subscribe to all active rooms in real time.
 * Simple query (no composite index) + client-side filter.
 */
export function subscribeRooms(
  cb: (rooms: ChatRoom[]) => void,
  max = 50
): Unsubscribe {
  const q = query(
    chatRoomsCol(),
    orderBy('createdAt', 'desc'),
    limit(max)
  );
  return onSnapshot(q, (snap) => {
    const rooms = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<ChatRoom, 'id'>) }))
      .filter((r) => r.isActive !== false);
    cb(rooms);
  });
}

/**
 * Subscribe to a single room.
 */
export function subscribeRoom(
  roomId: string,
  cb: (room: ChatRoom | null) => void
): Unsubscribe {
  return onSnapshot(chatRoomDoc(roomId), (snap) => {
    if (!snap.exists()) {
      cb(null);
      return;
    }
    cb({ id: snap.id, ...(snap.data() as Omit<ChatRoom, 'id'>) });
  });
}

// ------------------------------------------------------------
// MESSAGES
// ------------------------------------------------------------

/**
 * Subscribe to the last N messages in a room (real-time).
 */
export function subscribeMessages(
  roomId: string,
  cb: (messages: ChatMessage[]) => void,
  max = 200
): Unsubscribe {
  const q = query(
    chatMessagesCol(roomId),
    orderBy('createdAt', 'asc'),
    limit(max)
  );
  return onSnapshot(q, (snap) => {
    const msgs: ChatMessage[] = snap.docs.map((d) => ({
      id: d.id,
      roomId,
      ...(d.data() as Omit<ChatMessage, 'id' | 'roomId'>),
    }));
    cb(msgs);
  });
}

/**
 * Send a new message. Also bumps room.lastMessageAt + preview.
 */
export async function sendMessage(
  roomId: string,
  input: ChatMessageInput
): Promise<string> {
  if (!input.text.trim()) throw new Error('Empty message');
  if (input.text.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message too long (max ${MAX_MESSAGE_LENGTH} chars)`);
  }

  const docRef = await addDoc(chatMessagesCol(roomId), {
    ...input,
    text: input.text.trim(),
    type: input.type ?? 'text',
    createdAt: serverTimestamp(),
    expiresAt: computeExpiresAt(),
  });

  // Denormalized preview for room list
  await updateDoc(chatRoomDoc(roomId), {
    lastMessageAt: Timestamp.now(),
    lastMessagePreview: input.text.trim().slice(0, 80),
  });

  return docRef.id;
}

// ------------------------------------------------------------
// PRESENCE
// ------------------------------------------------------------

/**
 * Mark user as online in a room (called on page enter).
 */
export async function setPresence(
  roomId: string,
  userId: string,
  userName: string,
  state: PresenceState = 'online'
): Promise<void> {
  await setDoc(
    chatPresenceDoc(roomId, userId),
    {
      docId: presenceDocId(roomId, userId),
      roomId,
      userId,
      userName,
      state,
      lastSeen: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Remove user presence (called on page leave).
 */
export async function clearPresence(
  roomId: string,
  userId: string
): Promise<void> {
  try {
    await deleteDoc(chatPresenceDoc(roomId, userId));
  } catch {
    // ignore — presence may already be gone
  }
}

/**
 * Subscribe to presence docs for a room.
 */
export function subscribePresence(
  roomId: string,
  cb: (users: ChatPresence[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'chatPresence'),
    where('roomId', '==', roomId)
  );
  return onSnapshot(q, (snap) => {
    const users: ChatPresence[] = snap.docs.map((d) => ({
      ...(d.data() as Omit<ChatPresence, 'docId'>),
      docId: d.id,
    }));
    cb(users);
  });
}