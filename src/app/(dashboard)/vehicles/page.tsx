import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { VehiclesPage as VehiclesPageClient } from '@/components/vehicles/vehicles-page';

export default async function VehiclesPage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  let query = admin.from('vehicles').select('*, clients(company_legal_name)').order('unit_number');

  if (user.role === 'staff') query = query.in('client_id', user.assignedClientIds);

  const { data: vehicles } = await query;
  const { data: clients } = await admin.from('clients').select('id, company_legal_name').eq('status', 'active').order('company_legal_name');

  return <VehiclesPageClient vehicles={vehicles ?? []} clients={clients ?? []} userRole={user.role} />;
}