import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { AlertsPage as AlertsPageClient } from '@/components/alerts/alerts-page';

export default async function AlertsPage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  let query = admin
    .from('alerts')
    .select('*, clients(company_legal_name), drivers(full_name), vehicles(unit_number)')
    .order('severity', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200);

  if (user.role === 'staff') query = query.in('client_id', user.assignedClientIds);

  const { data: alerts } = await query;

  return <AlertsPageClient alerts={alerts ?? []} userRole={user.role} />;
}