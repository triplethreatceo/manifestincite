import { redirect, notFound } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { DriverForm } from '@/components/drivers/driver-form';

export default async function EditDriverPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user || user.role === 'client') redirect('/drivers');

  const { id } = await params;
  const admin = createAdminClient();
  const { data: driver } = await admin.from('drivers').select('*').eq('id', id).single();
  if (!driver) notFound();

  const { data: clients } = await admin.from('clients').select('id, company_legal_name').eq('status', 'active').order('company_legal_name');

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Driver</h1>
        <p className="text-sm text-muted-foreground">{driver.full_name}</p>
      </div>
      <DriverForm clients={clients ?? []} driver={driver} />
    </div>
  );
}