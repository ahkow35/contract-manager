import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionUser } from '@/lib/supabase/auth';
import { getTemplate } from '@/lib/merge/registry';

/** Log a document generation. Records template + user + timestamp ONLY — never any field values. */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const templateId = String(body.templateId ?? '').slice(0, 120);
  // Only accept ids that correspond to a real registered template (prevents analytics pollution).
  if (!getTemplate(templateId)) return NextResponse.json({ error: 'unknown templateId' }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from('usage_events').insert({
    user_id: user.id,
    user_email: user.email,
    template_id: templateId,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
