import { redirect, notFound } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { ClientForm } from '@/components/clients/client-form';

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user || user.role !== 'admin') redirect('/clients');

  const { id } = await params;
  const admin = createAdminClient();
  const { data: client } = await admin.from('clients').select('*').eq('id', id).single();

  if (!client) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Client</h1>
        <p className="text-sm text-muted-foreground">{client.company_legal_name}</p>
      </div>
      <ClientForm client={client} />
    </div>
  );
}