import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import WS from 'ws';
import { config } from '../config/index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RealtimeTransport = any;

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    _client = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      realtime: { transport: WS as unknown as RealtimeTransport },
    });
  }
  return _client;
}
