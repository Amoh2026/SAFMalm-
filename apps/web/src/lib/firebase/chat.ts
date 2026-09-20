// ============================================================
// Chat Firestore helpers — uses the existing client.ts db
// ============================================================
// v4 — added room session tracking helpers
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
  arrayUnion,
  arrayRemove,
  Timestamp,
  where,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase/client';
import { computeExpiresAt } from '@/lib/chat/ttl';
import {
  MAX_MESSAGE_LENGTH,
  MAX_REQUEST_MESSAGE_LENGTH,
  SESSION_HEARTBEAT_MS,
  presenceDocId,
  normalizeRoom,
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
// ROOMS — reads
// ------------------------------------------------------------

export async function getRoom(roomId: string): Promise<ChatRoom | null> {
  const snap = await getDoc(chatRoomDoc(roomId));
  if (!snap.exists()) return null;
  return normalizeRoom({ id: snap.id, ...snap.data() });
}

export async function listRooms(max = 50): Promise<ChatRoom[]> {
  const q = query(chatRoomsCol(), orderBy('createdAt', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => normalizeRoom({ id: d.id, ...d.data() }))
    .filter((r) => r.isActive !== false);
}

export function subscribeRooms(
  cb: (rooms: ChatRoom[]) => void,
  max = 50
): Unsubscribe {
  const q = query(chatRoomsCol(), orderBy('createdAt', 'desc'), limit(max));
  return onSnapshot(q, (snap) => {
    const rooms = snap.docs
      .map((d) => normalizeRoom({ id: d.id, ...d.data() }))
      .filter((r) => r.isActive !== false);
    cb(rooms);
  });
}

export function subscribeRoom(
  roomId: string,
  cb: (room: ChatRoom | null) => void
): Unsubscribe {
  return onSnapshot(chatRoomDoc(roomId), (snap) => {
    if (!snap.exists()) {
      cb(null);
      return;
    }
    cb(normalizeRoom({ id: snap.id, ...snap.data() }));
  });
}

export function subscribeUserRooms(
  userId: string,
  cb: (rooms: ChatRoom[]) => void
): Unsubscribe {
  const q = query(chatRoomsCol(), orderBy('createdAt', 'desc'), limit(100));
  return onSnapshot(q, (snap) => {
    const rooms = snap.docs
      .map((d) => normalizeRoom({ id: d.id, ...d.data() }))
      .filter((r) => r.isActive !== false)
      .filter((r) => (r.members ?? []).some((m) => m.id === userId));
    cb(rooms);
  });
}

// ------------------------------------------------------------
// MESSAGES
// ------------------------------------------------------------

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

  await updateDoc(chatRoomDoc(roomId), {
    lastMessageAt: Timestamp.now(),
    lastMessagePreview: input.text.trim().slice(0, 80),
  });

  return docRef.id;
}

// ------------------------------------------------------------
// PRESENCE
// ------------------------------------------------------------

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

export async function clearPresence(
  roomId: string,
  userId: string
): Promise<void> {
  try {
    await deleteDoc(chatPresenceDoc(roomId, userId));
  } catch {
    // ignore
  }
}

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

// ------------------------------------------------------------
// v4 — SESSION TRACKING (for private room visibility)
// ------------------------------------------------------------

/**
 * Add current user to the room's session occupants.
 * Called when the user enters the room page.
 */
export async function enterRoomSession(
  roomId: string,
  userId: string
): Promise<void> {
  try {
    await updateDoc(chatRoomDoc(roomId), {
      sessionOccupants: arrayUnion(userId),
    });
  } catch (err) {
    console.error('enterRoomSession error:', err);
  }
}

/**
 * Remove current user from the room's session occupants.
 * Called on unmount or page leave.
 */
export async function leaveRoomSession(
  roomId: string,
  userId: string
): Promise<void> {
  try {
    await updateDoc(chatRoomDoc(roomId), {
      sessionOccupants: arrayRemove(userId),
    });
  } catch (err) {
    // Fails silently if the user is offline or doc deleted
    console.error('leaveRoomSession error:', err);
  }
}

/**
 * Mark the current user (owner) as active in the room.
 * Called when the owner opens the room.
 */
export async function setOwnerActive(
  roomId: string,
  active: boolean
): Promise<void> {
  try {
    if (active) {
      await updateDoc(chatRoomDoc(roomId), {
        ownerIsActive: true,
        ownerLastActiveAt: Timestamp.now(),
      });
    } else {
      await updateDoc(chatRoomDoc(roomId), {
        ownerIsActive: false,
        ownerLastActiveAt: Timestamp.now(),
      });
    }
  } catch (err) {
    console.error('setOwnerActive error:', err);
  }
}

/**
 * Heartbeat — refresh ownerLastActiveAt while the owner is in the room.
 * Call this every SESSION_HEARTBEAT_MS milliseconds while owner is on the page.
 */
export async function ownerHeartbeat(roomId: string): Promise<void> {
  try {
    await updateDoc(chatRoomDoc(roomId), {
      ownerLastActiveAt: Timestamp.now(),
    });
  } catch {
    // ignore transient errors
  }
}

/**
 * Subscribe to rooms the user owns (for the sidebar with pending count).
 */
export function subscribeOwnedRooms(
  userId: string,
  cb: (rooms: ChatRoom[]) => void
): Unsubscribe {
  const q = query(
    chatRoomsCol(),
    where('createdBy', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    const rooms = snap.docs
      .map((d) => normalizeRoom({ id: d.id, ...d.data() }))
      .filter((r) => r.isActive !== false);
    cb(rooms);
  });
}

/**
 * Total pending requests across all rooms owned by user.
 */
export function subscribeTotalPendingCount(
  userId: string,
  cb: (count: number) => void
): Unsubscribe {
  return subscribeOwnedRooms(userId, (rooms) => {
    const total = rooms.reduce(
      (sum, r) => sum + (r.pendingRequests?.length ?? 0),
      0
    );
    cb(total);
  });
}

/**
 * Ensure the room's session fields are initialized.
 * Called on room creation to set defaults.
 */
export async function ensureRoomSessionFields(roomId: string): Promise<void> {
  try {
    const ref = chatRoomDoc(roomId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const data = snap.data() as any;
    const updates: Record<string, any> = {};

    if (data.ownerIsActive === undefined) {
      updates.ownerIsActive = false;
    }
    if (data.ownerLastActiveAt === undefined) {
      updates.ownerLastActiveAt = null;
    }
    if (data.sessionOccupants === undefined) {
      updates.sessionOccupants = [];
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(ref, updates);
    }
  } catch (err) {
    console.error('ensureRoomSessionFields error:', err);
  }
}