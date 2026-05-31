import { z } from 'zod';

export const addFavoriteSchema = z.object({
  coin_id: z.string().min(1),
  coin_symbol: z.string().min(1),
});

export const createAlertSchema = z.object({
  coin_id: z.string().min(1),
  coin_symbol: z.string().min(1),
  condition: z.enum(['above', 'below']),
  target_price: z.number().positive(),
});

export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>;
export type CreateAlertInput = z.infer<typeof createAlertSchema>;
