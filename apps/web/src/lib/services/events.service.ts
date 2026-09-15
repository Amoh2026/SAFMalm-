import { db } from '../firebase/client';
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy,
  where,
  limit as firestoreLimit,
  Timestamp
} from 'firebase/firestore';
import { Event, EventCreate } from '@/types';

const COLLECTION = 'events';

export async function getEvents(limit?: number): Promise<Event[]> {
  let q = query(collection(db, COLLECTION), orderBy('date', 'desc'));
  if (limit) {
    q = query(q, firestoreLimit(limit));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  } as Event));
}

export async function getEvent(id: string): Promise<Event | null> {
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Event;
}

export async function createEvent(data: EventCreate): Promise<Event> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return { id: docRef.id, ...data } as Event;
}

export async function updateEvent(id: string, data: Partial<EventCreate>): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}