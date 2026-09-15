import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(3, 'Titel måste vara minst 3 tecken'),
  description: z.string().min(10, 'Beskrivning måste vara minst 10 tecken'),
  date: z.string().min(1, 'Datum krävs'),
  time: z.string().optional(),
  location: z.string().min(1, 'Plats krävs'),
  image: z.string().optional(),
  maxParticipants: z.number().optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;