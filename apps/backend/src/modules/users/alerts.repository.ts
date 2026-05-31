import { getSupabaseAdmin } from '../../lib/supabase.js';
import type { PriceAlert } from '@monabit/shared-types';

export async function listAlerts(userId: string): Promise<PriceAlert[]> {
  const { data } = await getSupabaseAdmin()
    .from('price_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data ?? []) as PriceAlert[];
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
  return data as PriceAlert;
}

export async function deactivateAlert(userId: string, alertId: string): Promise<PriceAlert | null> {
  const { data } = await getSupabaseAdmin()
    .from('price_alerts')
    .update({ is_active: false })
    .eq('id', alertId)
    .eq('user_id', userId)
    .select()
    .single();
  return data as PriceAlert | null;
}

export async function deleteAlert(userId: string, alertId: string): Promise<PriceAlert | null> {
  const { data } = await getSupabaseAdmin()
    .from('price_alerts')
    .delete()
    .eq('id', alertId)
    .eq('user_id', userId)
    .select()
    .single();
  return data as PriceAlert | null;
}
