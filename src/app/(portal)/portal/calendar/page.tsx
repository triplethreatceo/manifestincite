import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { CalendarPage } from '@/components/calendar/calendar-page';

export default async function PortalCalendarPage() {
  const user = await getAuthUser();
  if (!user || !user.clientId) redirect('/login');

  const admin = createAdminClient();
  const clientId = user.clientId;

  const [{ data: alerts }, { data: invoices }, { data: events }] = await Promise.all([
    admin.from('alerts').select('id, title, due_date, severity, status, category, client_id, clients(company_legal_name)').eq('client_id', clientId).not('due_date', 'is', null).in('status', ['open', 'in_progress']),
    admin.from('invoices').select('id, invoice_number, due_date, status, client_id, clients(company_legal_name)').eq('client_id', clientId).in('status', ['unpaid', 'overdue']),
    admin.from('calendar_events').select('*, clients(company_legal_name)').eq('client_id', clientId),
  ]);

  return <CalendarPage alerts={alerts ?? []} invoices={invoices ?? []} events={events ?? []} />;
}