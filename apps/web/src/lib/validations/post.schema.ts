import { z } from 'zod';

export const postSchema = z.object({
  title: z.string().min(3, 'Titel måste vara minst 3 tecken'),
  content: z.string().min(10, 'Innehåll måste vara minst 10 tecken'),
  excerpt: z.string().min(10, 'Ingress måste vara minst 10 tecken'),
  image: z.string().optional(),
});

export type PostFormData = z.infer<typeof postSchema>;