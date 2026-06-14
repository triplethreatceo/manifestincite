import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();

  // Fetch summary stats
  const [
    { count: totalActiveClients },
    { count: totalInactiveClients },
    { data: openAlerts },
    { data: criticalAlerts },
    { data: unpaidInvoices },
    { data: recentAlerts },
    { data: recentDocuments },
    { data: openTasks },
    { data: upcomingDeadlines },
  ] = await Promise.all([
    admin.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'inactive'),
    admin.from('alerts').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
    admin.from('alerts').select('*', { count: 'exact', head: true }).eq('severity', 'critical').in('status', ['open', 'in_progress']),
    admin.from('invoices').select('*, clients(company_legal_name)').in('status', ['unpaid', 'overdue']).order('due_date', { ascending: true }).limit(10),
    admin.from('alerts').select('*, clients(company_legal_name)').in('status', ['open', 'in_progress']).order('created_at', { ascending: false }).limit(10),
    admin.from('documents').select('*, clients(company_legal_name), users!documents_uploaded_by_fkey(full_name)').order('created_at', { ascending: false }).limit(10),
    admin.from('tasks').select('*, clients(company_legal_name), users!tasks_assigned_staff_id_fkey(full_name)').in('status', ['pending', 'in_progress', 'waiting_on_client']).order('due_date', { ascending: true }).limit(10),
    admin.from('alerts').select('*, clients(company_legal_name)').in('status', ['open', 'in_progress']).not('due_date', 'is', null).order('due_date', { ascending: true }).limit(10),
  ]);

  const stats = {
    totalActiveClients: totalActiveClients ?? 0,
    totalInactiveClients: totalInactiveClients ?? 0,
    openAlerts: openAlerts?.length ?? 0,
    criticalAlerts: criticalAlerts?.length ?? 0,
  };

  return (
    <AdminDashboard
      stats={stats}
      recentAlerts={recentAlerts ?? []}
      unpaidInvoices={unpaidInvoices ?? []}
      recentDocuments={recentDocuments ?? []}
      openTasks={openTasks ?? []}
      upcomingDeadlines={upcomingDeadlines ?? []}
    />
  );
}