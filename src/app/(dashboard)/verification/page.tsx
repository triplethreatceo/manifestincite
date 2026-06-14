import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { VerificationDashboard } from '@/components/verification/verification-dashboard';

export default async function VerificationPage() {
  const user = await getAuthUser();
  if (!user || user.role === 'client') redirect('/dashboard');

  const admin = createAdminClient();

  const [
    { count: verifiedDrivers },
    { count: pendingDrivers },
    { count: verifiedCarriers },
    { count: pendingCarriers },
    { count: pendingReferences },
    { count: totalReferences },
    { data: recentReferences },
    { data: recentEvaluations },
  ] = await Promise.all([
    admin.from('drivers').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified'),
    admin.from('drivers').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    admin.from('clients').select('*', { count: 'exact', head: true }).eq('carrier_verification_status', 'verified'),
    admin.from('clients').select('*', { count: 'exact', head: true }).eq('carrier_verification_status', 'pending'),
    admin.from('employment_references').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('employment_references').select('*', { count: 'exact', head: true }),
    admin.from('employment_references').select('*, drivers(full_name), clients!employment_references_carrier_id_fkey(company_legal_name)').order('created_at', { ascending: false }).limit(5),
    admin.from('hiring_evaluations').select('*, drivers(full_name), clients!hiring_evaluations_carrier_id_fkey(company_legal_name), users!hiring_evaluations_evaluated_by_fkey(full_name)').order('created_at', { ascending: false }).limit(5),
  ]);

  return (
    <VerificationDashboard
      stats={{
        verifiedDrivers: verifiedDrivers ?? 0,
        pendingDrivers: pendingDrivers ?? 0,
        verifiedCarriers: verifiedCarriers ?? 0,
        pendingCarriers: pendingCarriers ?? 0,
        pendingReferences: pendingReferences ?? 0,
        totalReferences: totalReferences ?? 0,
      }}
      recentReferences={recentReferences ?? []}
      recentEvaluations={recentEvaluations ?? []}
    />
  );
}