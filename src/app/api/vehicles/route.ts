import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessClient } from '@/lib/permissions';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role === 'client') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const body = await request.json();
  if (!canAccessClient(user.role, body.client_id, user.clientId, user.assignedClientIds)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from('vehicles').insert(body).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id');
  const admin = createAdminClient();

  let query = admin.from('vehicles').select('*, clients(company_legal_name)').order('unit_number');

  if (clientId) {
    query = query.eq('client_id', clientId);
  } else if (user.role === 'staff') {
    query = query.in('client_id', user.assignedClientIds);
  } else if (user.role === 'client' && user.clientId) {
    query = query.eq('client_id', user.clientId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}