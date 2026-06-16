import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionUser } from '@/lib/supabase/auth';

interface Row {
  template_id: string;
  user_email: string | null;
  created_at: string;
}

export async function GET() {
  const caller = await getSessionUser();
  if (!caller || caller.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('usage_events')
    .select('template_id, user_email, created_at')
    .order('created_at', { ascending: false })
    .limit(5000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as Row[];
  const now = Date.now();
  const since30 = now - 30 * 864e5;
  const since7 = now - 7 * 864e5;

  const byTemplate: Record<string, number> = {};
  const byUser: Record<string, number> = {};
  let last30 = 0;
  let last7 = 0;
  for (const r of rows) {
    byTemplate[r.template_id] = (byTemplate[r.template_id] ?? 0) + 1;
    const who = r.user_email ?? 'unknown';
    byUser[who] = (byUser[who] ?? 0) + 1;
    const t = new Date(r.created_at).getTime();
    if (t >= since30) last30++;
    if (t >= since7) last7++;
  }

  const sortDesc = (o: Record<string, number>) =>
    Object.entries(o).map(([k, v]) => ({ key: k, count: v })).sort((a, b) => b.count - a.count);

  return NextResponse.json({
    total: rows.length,
    last30,
    last7,
    byTemplate: sortDesc(byTemplate),
    byUser: sortDesc(byUser),
    recent: rows.slice(0, 25),
  });
}
