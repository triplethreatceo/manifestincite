import { redirect, notFound } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { VerificationCarrierDetail } from '@/components/verification/verification-carrier-detail';

export default async function VerificationCarrierDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user || user.role === 'client') redirect('/dashboard');

  const { id } = await params;
  const admin = createAdminClient();

  const { data: carrier } = await admin
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (!carrier) notFound();

  const [
    { data: submittedReferences },
    { data: drivers },
  ] = await Promise.all([
    admin.from('employment_references')
      .select('*, drivers(full_name), users!employment_references_submitted_by_fkey(full_name)')
      .eq('carrier_id', id)
      .order('created_at', { ascending: false }),
    admin.from('drivers')
      .select('id, full_name, verification_status')
      .eq('client_id', id)
      .order('full_name'),
  ]);

  return (
    <VerificationCarrierDetail
      carrier={carrier}
      submittedReferences={submittedReferences ?? []}
      drivers={drivers ?? []}
      userId={user.id}
    />
  );
}