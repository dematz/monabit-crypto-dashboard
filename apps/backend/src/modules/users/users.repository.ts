import { getSupabaseAdmin } from '../../lib/supabase.js';
import { HttpError } from '../../shared/errors/index.js';
import type { UpdateUserInput, CreateUserInput } from './users.schema.js';

export async function listUsers() {
  const { data: profiles } = await getSupabaseAdmin()
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  const allUsers: { id: string; email?: string | null }[] = [];
  let page = 1;
  const perPage = 100;
  for (;;) {
    const { data: { users } = { users: [] } } = await getSupabaseAdmin().auth.admin.listUsers({
      page,
      perPage,
    });
    allUsers.push(...users);
    if (users.length < perPage) break;
    page++;
  }
  const emailMap = new Map(allUsers.map((u) => [u.id, u.email ?? null]));
  return (profiles ?? []).map((p) => ({
    ...p,
    email: emailMap.get(p.id) ?? p.email ?? null,
  }));
}

export async function createUser(input: CreateUserInput) {
  const { data: authUser, error } = await getSupabaseAdmin().auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      role: input.role,
      display_name: input.display_name ?? null,
    },
  });
  if (error) throw error;
  const { data: profile } = await getSupabaseAdmin()
    .from('user_profiles')
    .update({
      display_name: input.display_name ?? null,
    })
    .eq('id', authUser.user.id)
    .select()
    .single();
  return { ...profile, email: authUser.user.email };
}

export async function getUserById(id: string) {
  const { data: profile } = await getSupabaseAdmin()
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (!profile) return null;
  const { data: { user } = { user: null } } = await getSupabaseAdmin().auth.admin.getUserById(id);
  return { ...profile, email: user?.email ?? null };
}

export async function updateUser(id: string, input: UpdateUserInput) {
  if (input.role) {
    await getSupabaseAdmin().auth.admin.updateUserById(id, {
      user_metadata: { role: input.role },
    });
  }

  const { data } = await getSupabaseAdmin()
    .from('user_profiles')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (!data) throw new HttpError(404, 'User not found');
  return data;
}

export async function deactivateUser(id: string) {
  const { data } = await getSupabaseAdmin()
    .from('user_profiles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (!data) throw new HttpError(404, 'User not found');
  return data;
}
