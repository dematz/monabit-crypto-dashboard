import { z } from 'zod';

export const cryptoAssetSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  current_price: z.number(),
  market_cap: z.number(),
  total_volume: z.number(),
  price_change_percentage_24h: z.number(),
  image: z.string(),
  sparkline_in_7d: z.object({ price: z.array(z.number()) }).optional(),
});

export const marketOverviewSchema = z.object({
  total_market_cap: z.object({ usd: z.number() }),
  total_volume: z.object({ usd: z.number() }),
  market_cap_percentage: z.object({ btc: z.number(), eth: z.number() }),
  market_cap_change_percentage_24h_usd: z.number(),
});

export const coinHistoryPointSchema = z.object({
  t: z.string(),
  price: z.number(),
});

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().nullable().optional(),
  display_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  role: z.union([z.literal('admin'), z.literal('user')]),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const userPreferencesSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  theme: z.union([z.literal('light'), z.literal('dark'), z.literal('system')]),
  currency: z.string(),
  refresh_interval: z.number(),
});

export const favoriteSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  coin_id: z.string(),
  coin_symbol: z.string(),
  added_at: z.string(),
});

export const priceAlertSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  coin_id: z.string(),
  coin_symbol: z.string(),
  condition: z.union([z.literal('above'), z.literal('below')]),
  target_price: z.number(),
  is_active: z.boolean(),
  triggered_at: z.string().nullable(),
  created_at: z.string(),
});

export const ollamaResponseSchema = z.object({
  question: z.string(),
  answer: z.string(),
});
