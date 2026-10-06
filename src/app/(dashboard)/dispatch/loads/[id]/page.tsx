import { redirect, notFound } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripFinancialFields } from '@/lib/financial-fields';
import { LoadDetail } from '@/components/dispatch/load-detail';

export default async function LoadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user || user.role === 'client') redirect('/dashboard');

  const { id } = await params;
  const admin = createAdminClient();

  const { data: load } = await admin
    .from('loads')
    .select('*, drivers(id, full_name), vehicles(id, unit_number, make, model), clients(id, company_legal_name), users!loads_dispatcher_id_fkey(full_name)')
    .eq('id', id)
    .single();

  if (!load) notFound();

  const [
    { data: statusUpdates },
    { data: documents },
    { data: messages },
  ] = await Promise.all([
    admin.from('load_status_updates')
      .select('*, users!load_status_updates_updated_by_fkey(full_name)')
      .eq('load_id', id)
      .order('created_at', { ascending: false }),
    admin.from('load_documents')
      .select('*, users!load_documents_uploaded_by_fkey(full_name)')
      .eq('load_id', id)
      .order('created_at', { ascending: false }),
    admin.from('messages')
      .select('*, users!messages_sender_id_fkey(full_name)')
      .eq('load_id', id)
      .order('created_at', { ascending: true }),
  ]);

  const safeLoad = user.role === 'admin' ? load : stripFinancialFields(load);

  return (
    <LoadDetail
      load={safeLoad}
      statusUpdates={statusUpdates ?? []}
      documents={documents ?? []}
      messages={messages ?? []}
      userId={user.id}
      userRole={user.role}
    />
  );
}