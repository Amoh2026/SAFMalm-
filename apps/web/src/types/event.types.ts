export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  image?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventCreate {
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  image?: string;
  maxParticipants?: number;
}