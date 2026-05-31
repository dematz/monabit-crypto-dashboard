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

export const priceAlertSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  coin_id: z.string(),
  coin_symbol: z.string(),
  condition: z.enum(['above', 'below']),
  target_price: z.number(),
  is_active: z.boolean(),
  triggered_at: z.string().nullable(),
  created_at: z.string(),
});

export type PriceAlert = z.infer<typeof priceAlertSchema>;
