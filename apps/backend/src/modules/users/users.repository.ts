import { getSupabaseAdmin } from '../../lib/supabase.js';
import type { CreateUserInput, UpdateUserInput } from './users.schema.js';

export async function listUsers() {
  const { data } = await getSupabaseAdmin()
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function getUserById(id: string) {
  const { data } = await getSupabaseAdmin()
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const { data } = await getSupabaseAdmin()
    .from('user_profiles')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return data;
}

export async function deactivateUser(id: string) {
  const { data } = await getSupabaseAdmin()
    .from('user_profiles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return data;
}
