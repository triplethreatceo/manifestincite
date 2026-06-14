import { redirect, notFound } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessClient } from '@/lib/permissions';
import { DriverDetail } from '@/components/drivers/driver-detail';

export default async function DriverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const { id } = await params;
  const admin = createAdminClient();

  const { data: driver } = await admin
    .from('drivers')
    .select('*, clients(id, company_legal_name), vehicles(id, unit_number, make, model)')
    .eq('id', id)
    .single();

  if (!driver) notFound();
  if (!canAccessClient(user.role, driver.client_id, user.clientId, user.assignedClientIds)) {
    redirect('/drivers');
  }

  const { data: documents } = await admin
    .from('documents')
    .select('*, users!documents_uploaded_by_fkey(full_name)')
    .eq('driver_id', id)
    .order('created_at', { ascending: false });

  const { data: alerts } = await admin
    .from('alerts')
    .select('*')
    .eq('driver_id', id)
    .in('status', ['open', 'in_progress'])
    .order('severity', { ascending: false });

  const { data: drugRecords } = await admin
    .from('drug_alcohol_records')
    .select('*')
    .eq('driver_id', id)
    .order('test_date', { ascending: false });

  const { data: clearinghouseRecords } = await admin
    .from('clearinghouse_records')
    .select('*')
    .eq('driver_id', id)
    .order('query_date', { ascending: false });

  return (
    <DriverDetail
      driver={driver}
      documents={documents ?? []}
      alerts={alerts ?? []}
      drugRecords={drugRecords ?? []}
      clearinghouseRecords={clearinghouseRecords ?? []}
      userRole={user.role}
    />
  );
}