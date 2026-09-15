export type BookingStatus = 'pending' | 'approved' | 'rejected';

export interface Booking {
  id: string;
  userId?: string;
  userName?: string;
  name?: string;
  date: string;
  time: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  email?: string;
  phone?: string;
  roomPreference?: string;
  rules?: boolean;
  adminNote?: string | null;
  reviewedAt?: Date | null;
  reviewedBy?: string | null;
}

export interface BookingCreate {
  userId?: string;
  userName?: string;
  name: string;
  date: string;
  time: string;
  email?: string;
  phone?: string;
  roomPreference?: string;
  rules?: boolean;
}

export interface MemberBooking {
  id: string;
  name: string;
  phone: string;
  email: string;
  responsiblePerson: string;
  responsiblePhone: string;
  date: string;
  time: string;
  roomPreference: string;
  rules: boolean;
  userId: string | null;
  userEmail: string;
  status: BookingStatus;
  adminNote?: string | null;
  reviewedAt?: Date | null;
  reviewedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
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
  userId?: string | null;
  userEmail?: string;
}