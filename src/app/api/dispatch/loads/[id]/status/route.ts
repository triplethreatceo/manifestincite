import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user || user.role === 'client') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const admin = createAdminClient();

  // Update load status
  const update: Record<string, any> = { status: body.status };
  if (body.status === 'delivered') {
    update.actual_delivery_time = new Date().toISOString();
  }
  if (body.status === 'loaded' || body.status === 'en_route_pickup') {
    // Could set actual_pickup_time on 'loaded'
  }
  if (body.status === 'at_pickup') {
    update.actual_pickup_time = new Date().toISOString();
  }

  const { error: loadError } = await admin.from('loads').update(update).eq('id', id);
  if (loadError) return NextResponse.json({ error: loadError.message }, { status: 400 });

  // Create status update record
  const { data, error } = await admin.from('load_status_updates').insert({
    load_id: id,
    status: body.status,
    updated_by: body.updated_by ?? user.id,
    location: body.location ?? null,
    notes: body.notes ?? null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}