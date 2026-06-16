import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionUser } from '@/lib/supabase/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const caller = await getSessionUser();
  if (!caller || caller.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const role = body.role === 'admin' ? 'admin' : 'staff';

  if (id === caller.id && role !== 'admin') {
    return NextResponse.json({ error: 'You cannot remove your own admin role.' }, { status: 400 });
  }
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, { app_metadata: { role } });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, role });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const caller = await getSessionUser();
  if (!caller || caller.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  if (id === caller.id) {
    return NextResponse.json({ error: 'You cannot remove your own account.' }, { status: 400 });
  }
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
