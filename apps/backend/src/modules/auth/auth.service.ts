import { getSupabaseAdmin } from '../../lib/supabase.js';

export async function getMe(userId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data;
}
