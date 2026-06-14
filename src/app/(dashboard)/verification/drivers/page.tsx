import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { VerificationDriversPage } from '@/components/verification/verification-drivers-page';

export default async function VerificationDriversRoute() {
  const user = await getAuthUser();
  if (!user || user.role === 'client') redirect('/dashboard');

  const admin = createAdminClient();
  const { data: drivers } = await admin
    .from('drivers')
    .select('*, clients(company_legal_name)')
    .order('full_name');

  return <VerificationDriversPage drivers={drivers ?? []} />;
}