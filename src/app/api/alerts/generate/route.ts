import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateAlerts, updateComplianceStatus } from '@/lib/alerts/generate-alerts';

// POST /api/alerts/generate — run the alert engine
// Optional body: { client_id: "uuid" } to scope to one client
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role === 'client') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const clientId = body.client_id as string | undefined;

  const admin = createAdminClient();
  const result = await generateAlerts(admin, clientId);

  // Update compliance status for affected clients
  if (clientId) {
    await updateComplianceStatus(admin, clientId);
  } else {
    const { data: clients } = await admin.from('clients').select('id').eq('status', 'active');
    for (const c of clients ?? []) {
      await updateComplianceStatus(admin, c.id);
    }
  }

  return NextResponse.json(result);
}