import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import WS from 'ws';
import { config } from '../config/index.js';

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    _client = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      realtime: { transport: WS as any },
    });
  }
  return _client;
}
