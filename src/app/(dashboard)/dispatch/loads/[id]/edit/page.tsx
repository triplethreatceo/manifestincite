import { redirect, notFound } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { LoadForm } from '@/components/dispatch/load-form';

export default async function EditLoadPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user || user.role === 'client') redirect('/dispatch');

  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: load }, { data: clients }, { data: drivers }, { data: vehicles }] = await Promise.all([
    admin.from('loads').select('*').eq('id', id).single(),
    admin.from('clients').select('id, company_legal_name').eq('status', 'active').order('company_legal_name'),
    admin.from('drivers').select('id, full_name, client_id').eq('status', 'active').order('full_name'),
    admin.from('vehicles').select('id, unit_number, make, model, client_id').eq('status', 'active').order('unit_number'),
  ]);

  if (!load) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Load</h1>
        <p className="text-sm text-muted-foreground font-mono">{load.load_number}</p>
      </div>
      <LoadForm
        clients={clients ?? []}
        drivers={drivers ?? []}
        vehicles={vehicles ?? []}
        userId={user.id}
        userRole={user.role}
        load={load}
      />
    </div>
  );
}