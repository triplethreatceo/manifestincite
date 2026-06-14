import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { ClientsList } from '@/components/clients/clients-list';

export default async function ClientsPage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();

  let query = admin.from('clients').select('*').order('company_legal_name');

  // Staff: filter to assigned clients only
  if (user.role === 'staff') {
    query = query.in('id', user.assignedClientIds);
  }

  const { data: clients } = await query;

  return (
    <div className="space-y-6">
      <ClientsList clients={clients ?? []} userRole={user.role} />
    </div>
  );
}