import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { DispatchMessagesPage } from '@/components/dispatch/dispatch-messages-page';

export default async function DispatchMessagesRoute() {
  const user = await getAuthUser();
  if (!user || user.role === 'client') redirect('/dashboard');

  const admin = createAdminClient();

  // Get threads grouped by load
  const { data: loadThreads } = await admin
    .from('loads')
    .select('id, load_number, status, clients(company_legal_name), drivers(full_name)')
    .order('updated_at', { ascending: false })
    .limit(30);

  // Get recent messages
  const { data: recentMessages } = await admin
    .from('messages')
    .select('*, users!messages_sender_id_fkey(full_name), loads(load_number)')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <DispatchMessagesPage
      loadThreads={loadThreads ?? []}
      recentMessages={recentMessages ?? []}
      userId={user.id}
    />
  );
}