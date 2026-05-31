import { z } from 'zod';

export const updateUserSchema = z.object({
  display_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  role: z.enum(['admin', 'user']).optional(),
  is_active: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  display_name: z.string().optional(),
  role: z.enum(['admin', 'user']).default('user'),
});
