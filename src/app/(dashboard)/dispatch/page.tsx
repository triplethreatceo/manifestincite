import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { DispatchDashboard } from '@/components/dispatch/dispatch-dashboard';

export default async function DispatchPage() {
  const user = await getAuthUser();
  if (!user || user.role === 'client') redirect('/dashboard');

  const admin = createAdminClient();

  const activeStatuses = ['assigned', 'accepted', 'en_route_pickup', 'at_pickup', 'loaded', 'in_transit', 'at_delivery'];

  const [
    { data: activeLoads },
    { count: totalActive },
    { count: deliveredToday },
    { count: pickupsToday },
    { data: availableDrivers },
    { count: unreadMessages },
  ] = await Promise.all([
    admin.from('loads')
      .select('*, drivers(full_name), vehicles(unit_number), clients(company_legal_name)')
      .in('status', activeStatuses)
      .order('pickup_date', { ascending: true })
      .limit(20),
    admin.from('loads').select('*', { count: 'exact', head: true }).in('status', activeStatuses),
    admin.from('loads').select('*', { count: 'exact', head: true }).eq('status', 'delivered').gte('actual_delivery_time', new Date().toISOString().split('T')[0]),
    admin.from('loads').select('*', { count: 'exact', head: true }).in('status', activeStatuses).eq('pickup_date', new Date().toISOString().split('T')[0]),
    admin.from('drivers')
      .select('id, full_name, clients(company_legal_name)')
      .eq('status', 'active')
      .is('assigned_vehicle_id', null)
      .order('full_name')
      .limit(10),
    admin.from('messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
  ]);

  return (
    <DispatchDashboard
      activeLoads={activeLoads ?? []}
      stats={{
        totalActive: totalActive ?? 0,
        deliveredToday: deliveredToday ?? 0,
        pickupsToday: pickupsToday ?? 0,
        unreadMessages: unreadMessages ?? 0,
      }}
      availableDrivers={availableDrivers ?? []}
    />
  );
}