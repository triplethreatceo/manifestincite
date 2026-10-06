import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { UsersPage } from '@/components/admin/users-page';

export default async function AdminUsersPage() {
  const user = await getAuthUser();
  if (!user || user.role !== 'admin') redirect('/dashboard');

  const admin = createAdminClient();
  const { data: users } = await admin
    .from('users')
    .select('*')
    .order('full_name');

  // Fetch auth metadata for last_sign_in and invite status
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const authMap = new Map<string, { last_sign_in_at: string | null; invited_at: string | null }>();
  for (const au of authData?.users ?? []) {
    authMap.set(au.id, {
      last_sign_in_at: au.last_sign_in_at ?? null,
      invited_at: au.invited_at ?? null,
    });
  }

  const enrichedUsers = (users ?? []).map((u) => {
    const auth = authMap.get(u.id);
    return {
      ...u,
      last_sign_in_at: auth?.last_sign_in_at ?? null,
      invite_status: auth?.last_sign_in_at ? 'active' : (auth?.invited_at ? 'invited' : 'pending'),
    };
  });

  return <UsersPage users={enrichedUsers} currentUserId={user.id} />;
}