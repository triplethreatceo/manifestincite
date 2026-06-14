import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { ClientDashboard } from '@/components/portal/client-dashboard';

export default async function PortalDashboardPage() {
  const user = await getAuthUser();
  if (!user || !user.clientId) redirect('/login');

  const admin = createAdminClient();
  const clientId = user.clientId;

  const [
    { data: client },
    { data: alerts },
    { data: drivers },
    { data: vehicles },
    { data: documents },
    { data: invoices },
  ] = await Promise.all([
    admin.from('clients').select('*').eq('id', clientId).single(),
    admin.from('alerts').select('*').eq('client_id', clientId).in('status', ['open', 'in_progress']).order('severity', { ascending: false }),
    admin.from('drivers').select('*').eq('client_id', clientId).eq('status', 'active'),
    admin.from('vehicles').select('*').eq('client_id', clientId).eq('status', 'active'),
    admin.from('documents').select('*').eq('client_id', clientId).eq('visibility', 'client_visible').order('created_at', { ascending: false }).limit(10),
    admin.from('invoices').select('*').eq('client_id', clientId).order('invoice_date', { ascending: false }).limit(5),
  ]);

  if (!client) redirect('/login');

  return (
    <ClientDashboard
      client={client}
      alerts={alerts ?? []}
      drivers={drivers ?? []}
      vehicles={vehicles ?? []}
      documents={documents ?? []}
      invoices={invoices ?? []}
    />
  );
}