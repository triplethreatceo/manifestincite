import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const statusColor: Record<string, string> = {
  paid: 'bg-status-green/10 text-status-green',
  unpaid: 'bg-status-yellow/10 text-status-yellow',
  partial: 'bg-orange-100 text-orange-700',
  overdue: 'bg-status-red/10 text-status-red',
};

export default async function PortalInvoicesPage() {
  const user = await getAuthUser();
  if (!user || !user.clientId) redirect('/login');

  const admin = createAdminClient();
  const { data: invoices } = await admin
    .from('invoices')
    .select('*')
    .eq('client_id', user.clientId)
    .order('invoice_date', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Invoices</h1>
      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(invoices ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No invoices</TableCell></TableRow>
              ) : (
                (invoices ?? []).map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                    <TableCell>{format(new Date(inv.invoice_date), 'MM/dd/yyyy')}</TableCell>
                    <TableCell>{format(new Date(inv.due_date), 'MM/dd/yyyy')}</TableCell>
                    <TableCell className="text-right">${Number(inv.amount).toFixed(2)}</TableCell>
                    <TableCell className="text-right">${Number(inv.balance).toFixed(2)}</TableCell>
                    <TableCell><Badge className={statusColor[inv.status]} variant="secondary">{inv.status}</Badge></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}