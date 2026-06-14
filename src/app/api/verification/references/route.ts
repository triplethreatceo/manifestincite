import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role === 'client') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const body = await request.json();
  const admin = createAdminClient();

  // Check if the carrier is verified and can submit references
  const { data: carrier } = await admin
    .from('clients')
    .select('carrier_verification_status, can_submit_references')
    .eq('id', body.carrier_id)
    .single();

  const isVerifiedCarrier = carrier?.carrier_verification_status === 'verified' && carrier?.can_submit_references;

  const { data, error } = await admin
    .from('employment_references')
    .insert({
      ...body,
      verified_carrier_stamp: isVerifiedCarrier,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('employment_references')
    .select('*, drivers(full_name), clients!employment_references_carrier_id_fkey(company_legal_name)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}