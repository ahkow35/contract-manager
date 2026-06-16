import { isSupabaseConfigured } from './config';
import { createClient } from './server';

export interface SessionUser {
  email: string | null;
}

/** Returns the signed-in user, or null. In dev mode (no Supabase env) returns null without gating. */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ? { email: data.user.email ?? null } : null;
}
