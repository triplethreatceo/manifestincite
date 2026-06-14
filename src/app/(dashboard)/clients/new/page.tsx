import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { ClientForm } from '@/components/clients/client-form';

export default async function NewClientPage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/clients');

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add New Client</h1>
        <p className="text-sm text-muted-foreground">Create a new trucking company profile</p>
      </div>
      <ClientForm />
    </div>
  );
}