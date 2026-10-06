import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const user = await getAuthUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: users, error } = await admin
    .from('users')
    .select('*')
    .order('full_name');

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Fetch last_sign_in_at from auth.users via admin API
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const authMap = new Map<string, { last_sign_in_at: string | null; invited_at: string | null }>();
  for (const au of authData?.users ?? []) {
    authMap.set(au.id, {
      last_sign_in_at: au.last_sign_in_at ?? null,
      invited_at: au.invited_at ?? null,
    });
  }

  const enriched = (users ?? []).map((u) => {
    const auth = authMap.get(u.id);
    return {
      ...u,
      last_sign_in_at: auth?.last_sign_in_at ?? null,
      invite_status: auth?.last_sign_in_at ? 'active' : (auth?.invited_at ? 'invited' : 'pending'),
    };
  });

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { full_name, email, role } = body;

  if (!full_name || !email || !role) {
    return NextResponse.json({ error: 'Missing required fields: full_name, email, role' }, { status: 400 });
  }

  if (!['admin', 'staff'].includes(role)) {
    return NextResponse.json({ error: 'Role must be admin or staff' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Check if user already exists
  const { data: existing } = await admin
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
  }

  // Create auth user with invite (sends magic link)
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/set-password`;

  const { data: authUser, error: authError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role },
    redirectTo,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // Update the auto-created users row with the correct name and role
  await admin
    .from('users')
    .update({ full_name, role })
    .eq('id', authUser.user.id);

  return NextResponse.json({ id: authUser.user.id, email, full_name, role }, { status: 201 });
}