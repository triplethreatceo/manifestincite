import { redirect, notFound } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessClient } from '@/lib/permissions';
import { VehicleDetail } from '@/components/vehicles/vehicle-detail';

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const { id } = await params;
  const admin = createAdminClient();

  const { data: vehicle } = await admin
    .from('vehicles')
    .select('*, clients(id, company_legal_name)')
    .eq('id', id)
    .single();

  if (!vehicle) notFound();
  if (!canAccessClient(user.role, vehicle.client_id, user.clientId, user.assignedClientIds)) {
    redirect('/vehicles');
  }

  const { data: documents } = await admin
    .from('documents')
    .select('*, users!documents_uploaded_by_fkey(full_name)')
    .eq('vehicle_id', id)
    .order('created_at', { ascending: false });

  const { data: alerts } = await admin
    .from('alerts')
    .select('*')
    .eq('vehicle_id', id)
    .in('status', ['open', 'in_progress'])
    .order('severity', { ascending: false });

  const { data: maintenanceRecords } = await admin
    .from('vehicle_maintenance_records')
    .select('*')
    .eq('vehicle_id', id)
    .order('service_date', { ascending: false });

  return (
    <VehicleDetail
      vehicle={vehicle}
      documents={documents ?? []}
      alerts={alerts ?? []}
      maintenanceRecords={maintenanceRecords ?? []}
      userRole={user.role}
    />
  );
}