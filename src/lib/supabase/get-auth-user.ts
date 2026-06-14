import { createClient } from './server';
import { createAdminClient } from './admin';
import type { AuthUser } from '@/lib/types/auth';

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Use admin client to bypass RLS for profile lookup
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  let clientId: string | null = null;
  let assignedClientIds: string[] = [];

  if (profile.role === 'client') {
    // Get the client this user belongs to
    const { data: clientUser } = await admin
      .from('client_users')
      .select('client_id')
      .eq('user_id', user.id)
      .single();
    clientId = clientUser?.client_id ?? null;
  } else if (profile.role === 'staff') {
    // Get assigned clients for staff
    const { data: assignments } = await admin
      .from('staff_assignments')
      .select('client_id')
      .eq('user_id', user.id);
    assignedClientIds = (assignments ?? []).map((a) => a.client_id);
  }

  return {
    id: user.id,
    email: user.email!,
    role: profile.role,
    fullName: profile.full_name,
    clientId,
    assignedClientIds,
  };
}