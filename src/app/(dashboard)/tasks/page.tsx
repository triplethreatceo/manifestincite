import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { TasksPage as TasksPageClient } from '@/components/tasks/tasks-page';

export default async function TasksPage() {
  const user = await getAuthUser();
  if (!user || user.role === 'client') redirect('/login');

  const admin = createAdminClient();
  let query = admin
    .from('tasks')
    .select('*, clients(company_legal_name), users!tasks_assigned_staff_id_fkey(full_name)')
    .order('due_date', { ascending: true })
    .limit(200);

  if (user.role === 'staff') {
    query = query.in('client_id', user.assignedClientIds);
  }

  const { data: tasks } = await query;
  const { data: clients } = await admin.from('clients').select('id, company_legal_name').eq('status', 'active').order('company_legal_name');
  const { data: staffUsers } = await admin.from('users').select('id, full_name').in('role', ['admin', 'staff']).eq('is_active', true);

  return <TasksPageClient tasks={tasks ?? []} clients={clients ?? []} staff={staffUsers ?? []} userRole={user.role} />;
}