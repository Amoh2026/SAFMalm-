// src/types/booking.types.ts

export interface Booking {
  id: string;
  userId: string;
  email: string;
  date: string;
  time: string;
  service: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingCreate {
  userId: string;
  email: string;
  date: string;
  time: string;
  service: string;
  notes?: string;
}

// Extended booking for member booking page
export interface MemberBooking {
  id: string;
  name: string;
  phone: string;
  email: string;
  responsiblePerson?: string;
  responsiblePhone?: string;
  date: string;
  time: string;
  roomPreference?: string;
  rules?: boolean;
  userId?: string;
  userEmail?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'approved' | 'rejected';
  createdAt: Date | string;
  updatedAt: Date | string;
  approvedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
}

export interface MemberBookingCreate {
  name: string;
  phone: string;
  email: string;
  responsiblePerson?: string;
  responsiblePhone?: string;
  date: string;
  time: string;
  roomPreference?: string;
  rules?: boolean;
  userId?: string;
  userEmail?: string;
}