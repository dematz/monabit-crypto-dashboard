import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  currency: z.enum(['USD', 'EUR']).optional(),
  refresh_interval: z.number().int().min(5).max(300).optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
