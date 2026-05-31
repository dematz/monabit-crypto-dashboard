import { getSupabaseAdmin } from '../../lib/supabase.js';

export async function getMe(userId: string) {
  const { data: profile, error } = await getSupabaseAdmin()
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) return null;
  const { data: { user } = { user: null } } =
    await getSupabaseAdmin().auth.admin.getUserById(userId);
  return { ...profile, email: user?.email ?? null };
}
