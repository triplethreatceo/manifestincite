import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { CalendarPage as CalendarPageClient } from '@/components/calendar/calendar-page';

export default async function CalendarPage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();

  // Get alerts with due dates as calendar events
  let alertsQuery = admin
    .from('alerts')
    .select('id, title, due_date, severity, status, category, client_id, clients(company_legal_name)')
    .not('due_date', 'is', null)
    .in('status', ['open', 'in_progress'])
    .order('due_date');

  if (user.role === 'staff') alertsQuery = alertsQuery.in('client_id', user.assignedClientIds);

  // Get invoice due dates
  let invoicesQuery = admin
    .from('invoices')
    .select('id, invoice_number, due_date, status, client_id, clients(company_legal_name)')
    .in('status', ['unpaid', 'overdue'])
    .order('due_date');

  if (user.role === 'staff') invoicesQuery = invoicesQuery.in('client_id', user.assignedClientIds);

  // Get calendar events
  let eventsQuery = admin
    .from('calendar_events')
    .select('*, clients(company_legal_name)')
    .order('event_date');

  if (user.role === 'staff') eventsQuery = eventsQuery.in('client_id', user.assignedClientIds);

  const [{ data: alerts }, { data: invoices }, { data: events }] = await Promise.all([
    alertsQuery,
    invoicesQuery,
    eventsQuery,
  ]);

  return <CalendarPageClient alerts={alerts ?? []} invoices={invoices ?? []} events={events ?? []} />;
}