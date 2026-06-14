import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { DocumentsPage as DocumentsPageClient } from '@/components/documents/documents-page';

export default async function DocumentsPage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  let query = admin
    .from('documents')
    .select('*, clients(company_legal_name), users!documents_uploaded_by_fkey(full_name), drivers(full_name), vehicles(unit_number)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (user.role === 'staff') query = query.in('client_id', user.assignedClientIds);

  const { data: documents } = await query;
  const { data: clients } = await admin.from('clients').select('id, company_legal_name').eq('status', 'active').order('company_legal_name');

  return <DocumentsPageClient documents={documents ?? []} clients={clients ?? []} userRole={user.role} userId={user.id} />;
}