import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './config';

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
export const hasServiceRole = Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);

/** Service-role Supabase client — bypasses RLS. SERVER ONLY (never import from a client component). */
export function createAdminClient() {
  if (!hasServiceRole) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
  return createSupabaseClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
