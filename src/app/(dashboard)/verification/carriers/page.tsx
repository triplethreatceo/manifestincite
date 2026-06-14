import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { VerificationCarriersPage } from '@/components/verification/verification-carriers-page';

export default async function VerificationCarriersRoute() {
  const user = await getAuthUser();
  if (!user || user.role === 'client') redirect('/dashboard');

  const admin = createAdminClient();
  const { data: carriers } = await admin
    .from('clients')
    .select('*')
    .order('company_legal_name');

  return <VerificationCarriersPage carriers={carriers ?? []} />;
}