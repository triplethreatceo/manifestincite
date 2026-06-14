import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { VehicleForm } from '@/components/vehicles/vehicle-form';

export default async function NewVehiclePage({ searchParams }: { searchParams: Promise<{ client_id?: string }> }) {
  const user = await getAuthUser();
  if (!user || user.role === 'client') redirect('/vehicles');

  const { client_id } = await searchParams;
  const admin = createAdminClient();
  const { data: clients } = await admin.from('clients').select('id, company_legal_name').eq('status', 'active').order('company_legal_name');

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Add New Vehicle</h1>
      <VehicleForm clients={clients ?? []} defaultClientId={client_id} />
    </div>
  );
}