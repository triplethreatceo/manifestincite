import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {};
  if (body.role && ['admin', 'staff'].includes(body.role)) updates.role = body.role;
  if (typeof body.is_active === 'boolean') updates.is_active = body.is_active;
  if (body.full_name) updates.full_name = body.full_name;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  // Prevent deactivating yourself
  if (id === user.id && updates.is_active === false) {
    return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 });
  }

  const { error } = await admin.from('users').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Resend invite
  const user = await getAuthUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const admin = createAdminClient();

  // Get user email
  const { data: profile } = await admin.from('users').select('email').eq('id', id).single();
  if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/set-password`;

  const { error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: profile.email,
    options: { redirectTo },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}