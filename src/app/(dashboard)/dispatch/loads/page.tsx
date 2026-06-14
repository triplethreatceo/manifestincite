import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { DispatchLoadsPage } from '@/components/dispatch/dispatch-loads-page';

export default async function DispatchLoadsRoute() {
  const user = await getAuthUser();
  if (!user || user.role === 'client') redirect('/dashboard');

  const admin = createAdminClient();
  const { data: loads } = await admin
    .from('loads')
    .select('*, drivers(full_name), vehicles(unit_number), clients(company_legal_name)')
    .order('pickup_date', { ascending: false })
    .limit(100);

  return <DispatchLoadsPage loads={loads ?? []} />;
}