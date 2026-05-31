#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js/dist/index.cjs';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SERVICE_KEY;

if (!url || !serviceKey) {
  console.error('Missing required env vars: SUPABASE_URL, SERVICE_KEY');
  process.exit(1);
}

const serviceClient = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_ID = '09ce0fa0-b496-4f6a-8cba-0c790f56b8e1';

// Insert profile
const { data: profile, error: profileError } = await serviceClient
  .from('user_profiles')
  .upsert({ id: ADMIN_ID, display_name: 'Admin', role: 'admin', is_active: true }, { onConflict: 'id' })
  .select()
  .single();

console.log('Profile:', profileError ? `Error: ${profileError.message}` : `OK: ${profile.id}`);

// Insert preferences
const { error: prefsError } = await serviceClient
  .from('user_preferences')
  .upsert({ user_id: ADMIN_ID, theme: 'dark', currency: 'USD', refresh_interval: 60 }, { onConflict: 'user_id' })
  .select()
  .single();

console.log('Preferences:', prefsError ? `Error: ${prefsError.message}` : 'OK');

// Verify
const { data: verify } = await serviceClient
  .from('user_profiles')
  .select('id,display_name,role')
  .eq('id', ADMIN_ID)
  .single();

console.log('Verify:', JSON.stringify(verify));
