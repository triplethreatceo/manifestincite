import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { DriversPage as DriversPageClient } from '@/components/drivers/drivers-page';

export default async function DriversPage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  let query = admin.from('drivers').select('*, clients(company_legal_name)').order('full_name');

  if (user.role === 'staff') query = query.in('client_id', user.assignedClientIds);

  const { data: drivers } = await query;
  const { data: clients } = await admin.from('clients').select('id, company_legal_name').eq('status', 'active').order('company_legal_name');

  return <DriversPageClient drivers={drivers ?? []} clients={clients ?? []} userRole={user.role} />;
}