import { getSupabaseAdmin } from '../../lib/supabase.js';
import type { UpdatePreferencesInput } from './preferences.schema.js';

export async function getPreferences(userId: string) {
  const { data } = await getSupabaseAdmin()
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}

export async function upsertPreferences(userId: string, input: UpdatePreferencesInput) {
  const payload = {
    user_id: userId,
    ...input,
    updated_at: new Date().toISOString(),
  };

  const { data } = await getSupabaseAdmin()
    .from('user_preferences')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();
  return data;
}
