import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { isModuleEnabled } from '@/config/modules';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();

  const showAlerts = isModuleEnabled('alerts');
  const showInvoices = isModuleEnabled('invoices');
  const showTasks = isModuleEnabled('tasks');
  const showDocuments = isModuleEnabled('documents');

  const [
    { count: totalActiveClients },
    { count: totalInactiveClients },
    ...conditional
  ] = await Promise.all([
    admin.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'inactive'),
    ...(showAlerts
      ? [
          admin.from('alerts').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
          admin.from('alerts').select('*', { count: 'exact', head: true }).eq('severity', 'critical').in('status', ['open', 'in_progress']),
          admin.from('alerts').select('*, clients(company_legal_name)').in('status', ['open', 'in_progress']).order('created_at', { ascending: false }).limit(10),
          admin.from('alerts').select('*, clients(company_legal_name)').in('status', ['open', 'in_progress']).not('due_date', 'is', null).order('due_date', { ascending: true }).limit(10),
        ]
      : []),
    ...(showInvoices
      ? [admin.from('invoices').select('*, clients(company_legal_name)').in('status', ['unpaid', 'overdue']).order('due_date', { ascending: true }).limit(10)]
      : []),
    ...(showDocuments
      ? [admin.from('documents').select('*, clients(company_legal_name), users!documents_uploaded_by_fkey(full_name)').order('created_at', { ascending: false }).limit(10)]
      : []),
    ...(showTasks
      ? [admin.from('tasks').select('*, clients(company_legal_name), users!tasks_assigned_staff_id_fkey(full_name)').in('status', ['pending', 'in_progress', 'waiting_on_client']).order('due_date', { ascending: true }).limit(10)]
      : []),
  ]);

  let idx = 0;
  const openAlertsCount = showAlerts ? (conditional[idx++] as any)?.count ?? 0 : 0;
  const criticalAlertsCount = showAlerts ? (conditional[idx++] as any)?.count ?? 0 : 0;
  const recentAlerts = showAlerts ? (conditional[idx++] as any)?.data ?? [] : [];
  const upcomingDeadlines = showAlerts ? (conditional[idx++] as any)?.data ?? [] : [];
  const unpaidInvoices = showInvoices ? (conditional[idx++] as any)?.data ?? [] : [];
  const recentDocuments = showDocuments ? (conditional[idx++] as any)?.data ?? [] : [];
  const openTasks = showTasks ? (conditional[idx++] as any)?.data ?? [] : [];

  const stats = {
    totalActiveClients: totalActiveClients ?? 0,
    totalInactiveClients: totalInactiveClients ?? 0,
    openAlerts: openAlertsCount,
    criticalAlerts: criticalAlertsCount,
  };

  return (
    <AdminDashboard
      stats={stats}
      recentAlerts={recentAlerts}
      unpaidInvoices={unpaidInvoices}
      recentDocuments={recentDocuments}
      openTasks={openTasks}
      upcomingDeadlines={upcomingDeadlines}
      showAlerts={showAlerts}
      showInvoices={showInvoices}
      showTasks={showTasks}
      showDocuments={showDocuments}
    />
  );
}