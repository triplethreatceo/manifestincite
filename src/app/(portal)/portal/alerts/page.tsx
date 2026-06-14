import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { AlertsPage } from '@/components/alerts/alerts-page';

export default async function PortalAlertsPage() {
  const user = await getAuthUser();
  if (!user || !user.clientId) redirect('/login');

  const admin = createAdminClient();
  const { data: alerts } = await admin
    .from('alerts')
    .select('*, clients(company_legal_name), drivers(full_name), vehicles(unit_number)')
    .eq('client_id', user.clientId)
    .order('severity', { ascending: false });

  return <AlertsPage alerts={alerts ?? []} userRole="client" />;
}