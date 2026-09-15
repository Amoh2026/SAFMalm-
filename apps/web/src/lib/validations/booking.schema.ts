import { z } from 'zod';

export const bookingSchema = z.object({
  date: z.string().min(1, 'Datum krävs'),
  time: z.string().min(1, 'Tid krävs'),
  service: z.string().min(1, 'Tjänst krävs'),
  notes: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;