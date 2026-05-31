import { getSupabaseAdmin } from '../../lib/supabase.js';

export async function listFavorites(userId: string) {
  const { data } = await getSupabaseAdmin()
    .from('user_favorites')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: true });
  return data ?? [];
}

export async function addFavorite(userId: string, coinId: string, coinSymbol: string) {
  const { data } = await getSupabaseAdmin()
    .from('user_favorites')
    .insert({ user_id: userId, coin_id: coinId, coin_symbol: coinSymbol })
    .select()
    .single();
  return data;
}

export async function removeFavorite(userId: string, coinId: string) {
  const { data } = await getSupabaseAdmin()
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('coin_id', coinId)
    .select()
    .single();
  return data;
}
