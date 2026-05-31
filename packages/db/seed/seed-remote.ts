import { createClient } from '@supabase/supabase-js';

const url = 'https://xsnwzthikalbdkquidyi.supabase.co';
const serviceKey = process.env.SERVICE_KEY;

if (!serviceKey) {
  console.error('Missing SERVICE_KEY env var');
  process.exit(1);
}

const serviceClient = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_ID = '09ce0fa0-b496-4f6a-8cba-0c790f56b8e1';

async function main() {
  const { data: profile, error: profileError } = await serviceClient
    .from('user_profiles')
    .upsert({ id: ADMIN_ID, display_name: 'Admin', role: 'admin', is_active: true }, { onConflict: 'id' })
    .select()
    .single();

  console.log('Profile:', profileError ? `Error: ${profileError.message}` : `OK: ${profile.id}`);

  const { error: prefsError } = await serviceClient
    .from('user_preferences')
    .upsert({ user_id: ADMIN_ID, theme: 'dark', currency: 'USD', refresh_interval: 60 }, { onConflict: 'user_id' })
    .select()
    .single();

  console.log('Preferences:', prefsError ? `Error: ${prefsError.message}` : 'OK');

  const { data: verify } = await serviceClient
    .from('user_profiles')
    .select('id,display_name,role')
    .eq('id', ADMIN_ID)
    .single();

  console.log('Verify:', JSON.stringify(verify));
}

main();
