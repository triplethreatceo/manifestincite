import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { InvoicesPage as InvoicesPageClient } from '@/components/invoices/invoices-page';

export default async function InvoicesPage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  let query = admin
    .from('invoices')
    .select('*, clients(company_legal_name)')
    .order('invoice_date', { ascending: false })
    .limit(200);

  if (user.role === 'staff') query = query.in('client_id', user.assignedClientIds);

  const { data: invoices } = await query;
  const { data: clients } = await admin.from('clients').select('id, company_legal_name, monthly_service_fee').eq('status', 'active').order('company_legal_name');

  // Stats
  const all = invoices ?? [];
  const stats = {
    totalPaid: all.filter((i) => i.status === 'paid').reduce((sum, i) => sum + Number(i.amount), 0),
    totalUnpaid: all.filter((i) => i.status === 'unpaid' || i.status === 'partial').reduce((sum, i) => sum + Number(i.balance), 0),
    totalOverdue: all.filter((i) => i.status === 'overdue').reduce((sum, i) => sum + Number(i.balance), 0),
    mrr: (clients ?? []).reduce((sum, c) => sum + (Number(c.monthly_service_fee) || 0), 0),
  };

  return <InvoicesPageClient invoices={all} clients={clients ?? []} stats={stats} userRole={user.role} />;
}