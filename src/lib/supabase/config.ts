/* Auth is enforced only when Supabase env is present. Absent → dev mode (banner shown, no gate),
 * so the app runs locally without credentials. Set both vars in Vercel to turn the gate on. */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
