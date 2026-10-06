import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripFinancialFields } from '@/lib/financial-fields';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('loads')
    .select('*, drivers(full_name), vehicles(unit_number), clients(company_legal_name)')
    .order('pickup_date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const result = user.role === 'admin' ? data : stripFinancialFields(data ?? []);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role === 'client') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const body = await request.json();
  const admin = createAdminClient();
  const { data, error } = await admin.from('loads').insert(body).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}