import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { SettingsPage as SettingsClient } from '@/components/settings/settings-page';

export default async function SettingsPage() {
  const user = await getAuthUser();
  if (!user || user.role !== 'admin') redirect('/dashboard');

  const admin = createAdminClient();
  const { data: users } = await admin
    .from('users')
    .select('*')
    .order('full_name');

  return <SettingsClient users={users ?? []} currentUserId={user.id} />;
}