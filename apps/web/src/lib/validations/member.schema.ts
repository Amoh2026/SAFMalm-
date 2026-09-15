import { z } from 'zod';

export const memberSchema = z.object({
  name: z.string().min(2, 'Namn måste vara minst 2 tecken'),
  email: z.string().email('Ogiltig e-postadress'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type MemberFormData = z.infer<typeof memberSchema>;