import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripFinancialFields } from '@/lib/financial-fields';
import { DispatchAnalytics } from '@/components/dispatch/dispatch-analytics';

export default async function DispatchAnalyticsPage() {
  const user = await getAuthUser();
  if (!user || user.role === 'client') redirect('/dashboard');

  const admin = createAdminClient();

  const { data: loads } = await admin
    .from('loads')
    .select('id, client_id, load_number, status, pickup_date, delivery_date, origin_city, origin_state, destination_city, destination_state, rate, miles, deadhead_miles, rate_per_mile, weight, dispatch_fee_amount, dispatch_fee_percent, driver_pay, fuel_cost, broker_name, equipment_type, freight_type, commodity, drivers(full_name), clients(company_legal_name)')
    .order('pickup_date', { ascending: false });

  const safeLoads = user.role === 'admin' ? (loads ?? []) : stripFinancialFields(loads ?? []);
  return <DispatchAnalytics loads={safeLoads} userRole={user.role} />;
}