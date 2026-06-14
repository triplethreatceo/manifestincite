import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { VerificationReferencesPage } from '@/components/verification/verification-references-page';

export default async function VerificationReferencesRoute() {
  const user = await getAuthUser();
  if (!user || user.role === 'client') redirect('/dashboard');

  const admin = createAdminClient();

  const [
    { data: references },
    { data: drivers },
    { data: carriers },
  ] = await Promise.all([
    admin.from('employment_references')
      .select('*, drivers(full_name), clients!employment_references_carrier_id_fkey(company_legal_name), users!employment_references_submitted_by_fkey(full_name)')
      .order('created_at', { ascending: false }),
    admin.from('drivers').select('id, full_name').eq('status', 'active').order('full_name'),
    admin.from('clients').select('id, company_legal_name, can_submit_references, carrier_verification_status').eq('status', 'active').order('company_legal_name'),
  ]);

  return (
    <VerificationReferencesPage
      references={references ?? []}
      drivers={drivers ?? []}
      carriers={carriers ?? []}
      userId={user.id}
    />
  );
}