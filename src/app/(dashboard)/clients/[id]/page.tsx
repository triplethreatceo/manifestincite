import { redirect, notFound } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessClient } from '@/lib/permissions';
import { ClientDetail } from '@/components/clients/client-detail';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const { id } = await params;
  if (!canAccessClient(user.role, id, user.clientId, user.assignedClientIds)) {
    redirect('/clients');
  }

  const admin = createAdminClient();

  const [
    { data: client },
    { data: drivers },
    { data: vehicles },
    { data: alerts },
    { data: invoices },
    { data: documents },
  ] = await Promise.all([
    admin.from('clients').select('*').eq('id', id).single(),
    admin.from('drivers').select('*').eq('client_id', id).order('full_name'),
    admin.from('vehicles').select('*').eq('client_id', id).order('unit_number'),
    admin.from('alerts').select('*').eq('client_id', id).in('status', ['open', 'in_progress']).order('severity', { ascending: false }).limit(10),
    admin.from('invoices').select('*').eq('client_id', id).order('invoice_date', { ascending: false }).limit(10),
    admin.from('documents').select('*, users!documents_uploaded_by_fkey(full_name)').eq('client_id', id).order('created_at', { ascending: false }).limit(20),
  ]);

  if (!client) notFound();

  return (
    <ClientDetail
      client={client}
      drivers={drivers ?? []}
      vehicles={vehicles ?? []}
      alerts={alerts ?? []}
      invoices={invoices ?? []}
      documents={documents ?? []}
      userRole={user.role}
    />
  );
}