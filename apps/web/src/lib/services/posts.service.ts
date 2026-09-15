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
  limit as firestoreLimit,
  Timestamp,
} from 'firebase/firestore';

const COLLECTION = 'posts';

export async function getPosts(limit?: number): Promise<any[]> {
  let q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  if (limit) {
    q = query(q, firestoreLimit(limit));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getPost(id: string): Promise<any | null> {
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export async function createPost(data: any): Promise<any> {
  // Compute flags from media arrays
  const hasImages =
    !!data.imageUrl || (Array.isArray(data.images) && data.images.length > 0);
  const hasDocuments =
    Array.isArray(data.documents) && data.documents.length > 0;

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    imageUrl: data.imageUrl ?? '',
    images: data.images ?? [],
    documents: data.documents ?? [],
    hasImages,
    hasDocuments,
    date: new Date().toISOString(),
    views: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return {
    id: docRef.id,
    ...data,
    imageUrl: data.imageUrl ?? '',
    images: data.images ?? [],
    documents: data.documents ?? [],
    hasImages,
    hasDocuments,
  };
}

export async function updatePost(id: string, data: any): Promise<void> {
  // Compute flags from media arrays
  const hasImages =
    !!data.imageUrl || (Array.isArray(data.images) && data.images.length > 0);
  const hasDocuments =
    Array.isArray(data.documents) && data.documents.length > 0;

  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    images: data.images ?? [],
    documents: data.documents ?? [],
    hasImages,
    hasDocuments,
    updatedAt: Timestamp.now(),
  });
}

export async function deletePost(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}