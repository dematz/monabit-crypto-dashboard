import { getSupabaseAdmin } from '../../lib/supabase.js';
import { HttpError } from '../../shared/errors/index.js';
import { priceAlertSchema } from './alerts-favorites.schema.js';
import type { PriceAlert } from './alerts-favorites.schema.js';

function parseAlert(data: unknown): PriceAlert {
  const parsed = priceAlertSchema.safeParse(data);
  if (!parsed.success) {
    throw new HttpError(500, 'Failed to parse alert data from database');
  }
  return parsed.data;
}

function parseAlerts(data: unknown[]): PriceAlert[] {
  return data.map((item) => parseAlert(item));
}

export async function listAlerts(userId: string): Promise<PriceAlert[]> {
  const { data } = await getSupabaseAdmin()
    .from('price_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return parseAlerts(data ?? []);
}

export async function createAlert(
  userId: string,
  input: {
    coin_id: string;
    coin_symbol: string;
    condition: 'above' | 'below';
    target_price: number;
  },
): Promise<PriceAlert> {
  const { data } = await getSupabaseAdmin()
    .from('price_alerts')
    .insert({ user_id: userId, ...input })
    .select()
    .single();
  if (!data) throw new HttpError(500, 'Failed to create alert');
  return parseAlert(data);
}

export async function deactivateAlert(userId: string, alertId: string): Promise<PriceAlert | null> {
  const { data } = await getSupabaseAdmin()
    .from('price_alerts')
    .update({ is_active: false })
    .eq('id', alertId)
    .eq('user_id', userId)
    .select()
    .single();
  return data ? parseAlert(data) : null;
}

export async function deleteAlert(userId: string, alertId: string): Promise<PriceAlert | null> {
  const { data } = await getSupabaseAdmin()
    .from('price_alerts')
    .delete()
    .eq('id', alertId)
    .eq('user_id', userId)
    .select()
    .single();
  return data ? parseAlert(data) : null;
}
