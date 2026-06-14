import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role === 'client') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const body = await request.json();
  const admin = createAdminClient();
  const { data, error } = await admin.from('alerts').insert(body).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}