import { isSupabaseConfigured } from './config';
import { createClient } from './server';

export type Role = 'admin' | 'staff';

export interface SessionUser {
  id: string;
  email: string | null;
  role: Role;
}

/** Returns the signed-in user (with role from app_metadata), or null. Dev mode → null, no gate. */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const role: Role = data.user.app_metadata?.role === 'admin' ? 'admin' : 'staff';
  return { id: data.user.id, email: data.user.email ?? null, role };
}
