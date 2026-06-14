import { redirect, notFound } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { VerificationDriverDetail } from '@/components/verification/verification-driver-detail';

export default async function VerificationDriverDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user || user.role === 'client') redirect('/dashboard');

  const { id } = await params;
  const admin = createAdminClient();

  const { data: driver } = await admin
    .from('drivers')
    .select('*, clients(id, company_legal_name)')
    .eq('id', id)
    .single();

  if (!driver) notFound();

  const [
    { data: references },
    { data: evaluations },
    { data: accessRequests },
  ] = await Promise.all([
    admin.from('employment_references')
      .select('*, clients!employment_references_carrier_id_fkey(company_legal_name), users!employment_references_submitted_by_fkey(full_name)')
      .eq('driver_id', id)
      .order('created_at', { ascending: false }),
    admin.from('hiring_evaluations')
      .select('*, clients!hiring_evaluations_carrier_id_fkey(company_legal_name), users!hiring_evaluations_evaluated_by_fkey(full_name)')
      .eq('driver_id', id)
      .order('created_at', { ascending: false }),
    admin.from('profile_access_requests')
      .select('*, clients!profile_access_requests_requesting_carrier_id_fkey(company_legal_name)')
      .eq('driver_id', id)
      .order('created_at', { ascending: false }),
  ]);

  return (
    <VerificationDriverDetail
      driver={driver}
      references={references ?? []}
      evaluations={evaluations ?? []}
      accessRequests={accessRequests ?? []}
      userId={user.id}
    />
  );
}