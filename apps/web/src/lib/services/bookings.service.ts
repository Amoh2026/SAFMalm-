// src/lib/services/bookings.service.ts

import { db } from '@/lib/firebase/client';
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { Booking, BookingCreate, MemberBooking, MemberBookingCreate } from '@/types';

const COLLECTION = 'bookings';

// Get all bookings
export async function getBookings(): Promise<Booking[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    } as Booking));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

// Get booking by ID
export async function getBooking(id: string): Promise<Booking | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return { 
      id: docSnap.id, 
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Booking;
  } catch (error) {
    console.error('Error fetching booking:', error);
    return null;
  }
}

// Get bookings by user ID
export async function getBookingsByUserId(userId: string): Promise<Booking[]> {
  try {
    const q = query(
      collection(db, COLLECTION), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    } as Booking));
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return [];
  }
}

// Create a new booking
export async function createBooking(data: BookingCreate): Promise<Booking> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    const docSnap = await getDoc(docRef);
    return { 
      id: docRef.id, 
      ...docSnap.data(),
      createdAt: docSnap.data()?.createdAt?.toDate?.() || new Date(),
      updatedAt: docSnap.data()?.updatedAt?.toDate?.() || new Date(),
    } as Booking;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw new Error('Failed to create booking');
  }
}

// Create a member booking (for the member booking page)
export async function createMemberBooking(data: MemberBookingCreate): Promise<MemberBooking> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      name: data.name,
      phone: data.phone,
      email: data.email,
      responsiblePerson: data.responsiblePerson || data.name,
      responsiblePhone: data.responsiblePhone || data.phone,
      date: data.date,
      time: data.time,
      roomPreference: data.roomPreference || 'Ingen preferens',
      rules: data.rules || false,
      userId: data.userId || null,
      userEmail: data.userEmail || data.email,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return {
      id: docRef.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      responsiblePerson: data.responsiblePerson || data.name,
      responsiblePhone: data.responsiblePhone || data.phone,
      date: data.date,
      time: data.time,
      roomPreference: data.roomPreference || 'Ingen preferens',
      rules: data.rules || false,
      userId: data.userId || null,
      userEmail: data.userEmail || data.email,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as MemberBooking;
  } catch (error) {
    console.error('Error creating member booking:', error);
    throw new Error('Failed to create booking');
  }
}

// Update booking
export async function updateBooking(id: string, data: Partial<BookingCreate>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    throw new Error('Failed to update booking');
  }
}

// Delete booking
export async function deleteBooking(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw new Error('Failed to delete booking');
  }
}

// Update booking status
// Update booking status (admin action)
export async function updateBookingStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected',
  options?: {
    adminNote?: string | null;
    reviewedBy?: string | null;
  }
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      status,
      adminNote: options?.adminNote ?? null,
      reviewedAt: Timestamp.now(),
      reviewedBy: options?.reviewedBy ?? null,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw new Error('Failed to update booking status');
  }
}