// lib/types/booking.ts

export type BookingStatus = 'pending' | 'approved' | 'rejected';

export interface Local {
  id: string;
  name: string;
  address: string;
  description: string;
  rulesText: string;
  images?: string[];
  freeAccessDays?: string;
  bookingRequiredNote?: string;
}

export interface Booking {
  id: string;
  localId: string;
  localName: string;
  userId: string;
  bookerName: string;
  bookerPhone: string;
  bookerEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  roomPreference: 'ja' | 'nej' | 'spelar_ingen_roll';
  responsiblePersonName: string;
  responsiblePersonPhone: string;
  acceptedResponsibility: boolean;
  status: BookingStatus;
  adminNote?: string;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
}