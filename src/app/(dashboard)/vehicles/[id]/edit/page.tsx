import { redirect, notFound } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { VehicleForm } from '@/components/vehicles/vehicle-form';

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user || user.role === 'client') redirect('/vehicles');

  const { id } = await params;
  const admin = createAdminClient();
  const { data: vehicle } = await admin.from('vehicles').select('*').eq('id', id).single();
  if (!vehicle) notFound();

  const { data: clients } = await admin.from('clients').select('id, company_legal_name').eq('status', 'active').order('company_legal_name');

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Vehicle</h1>
        <p className="text-sm text-muted-foreground">
          {vehicle.unit_number ? `Unit ${vehicle.unit_number}` : `${vehicle.year ?? ''} ${vehicle.make ?? ''} ${vehicle.model ?? ''}`.trim()}
        </p>
      </div>
      <VehicleForm clients={clients ?? []} vehicle={vehicle} />
    </div>
  );
}