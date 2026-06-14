import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'client' || !user.clientId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const admin = createAdminClient();

  const { data, error } = await admin.from('documents').insert({
    client_id: user.clientId,
    category: body.category,
    document_name: body.document_name,
    document_type: body.document_type,
    file_path: body.file_path,
    file_size: body.file_size,
    uploaded_by: user.id,
    visibility: 'admin_only', // Client uploads start as admin-only pending review
    status: 'current',
    notes: body.notes,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}