'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Receipt, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { AppRole } from '@/lib/types/auth';

const statusColor: Record<string, string> = {
  paid: 'bg-status-green/10 text-status-green',
  unpaid: 'bg-status-yellow/10 text-status-yellow',
  partial: 'bg-orange-100 text-orange-700',
  overdue: 'bg-status-red/10 text-status-red',
};

interface Props {
  invoices: any[];
  clients: any[];
  stats: { totalPaid: number; totalUnpaid: number; totalOverdue: number; mrr: number };
  userRole: AppRole;
}

export function InvoicesPage({ invoices, clients, stats, userRole }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = invoices.filter((i) => {
    const matchesSearch = i.invoice_number.toLowerCase().includes(search.toLowerCase()) || i.clients?.company_legal_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function createInvoice(formData: FormData) {
    const body: Record<string, any> = {};
    formData.forEach((v, k) => { body[k] = v === '' ? null : v; });
    body.amount = parseFloat(body.amount);
    body.amount_paid = 0;

    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success('Invoice created');
      setDialogOpen(false);
      router.refresh();
    } else {
      toast.error('Failed to create invoice');
    }
  }

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        {userRole === 'admin' && (
          <Button onClick={() => setDialogOpen(true)} className="bg-[#C41E3A] hover:bg-[#A51830] text-white">
            <Plus className="h-4 w-4 mr-2" />New Invoice
          </Button>
        )}
      </div>

      {/* Billing Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">MRR</p><p className="text-2xl font-bold mt-1">{fmt(stats.mrr)}</p></div><TrendingUp className="h-5 w-5 text-muted-foreground/50" /></div></CardContent></Card>
        <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Paid</p><p className="text-2xl font-bold mt-1 text-status-green">{fmt(stats.totalPaid)}</p></div><DollarSign className="h-5 w-5 text-muted-foreground/50" /></div></CardContent></Card>
        <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Unpaid</p><p className="text-2xl font-bold mt-1 text-status-yellow">{fmt(stats.totalUnpaid)}</p></div><Receipt className="h-5 w-5 text-muted-foreground/50" /></div></CardContent></Card>
        <Card className={stats.totalOverdue > 0 ? 'border-l-4 border-l-status-red' : ''}><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Overdue</p><p className="text-2xl font-bold mt-1 text-status-red">{fmt(stats.totalOverdue)}</p></div><AlertTriangle className="h-5 w-5 text-muted-foreground/50" /></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground"><Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" />No invoices</TableCell></TableRow>
              ) : (
                filtered.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{inv.clients?.company_legal_name ?? '—'}</TableCell>
                    <TableCell className="text-sm">{format(new Date(inv.invoice_date), 'MM/dd/yyyy')}</TableCell>
                    <TableCell className="text-sm">{format(new Date(inv.due_date), 'MM/dd/yyyy')}</TableCell>
                    <TableCell className="text-right font-medium">{fmt(Number(inv.amount))}</TableCell>
                    <TableCell className="text-right font-medium">{fmt(Number(inv.balance))}</TableCell>
                    <TableCell><Badge className={statusColor[inv.status]} variant="secondary">{inv.status}</Badge></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Invoice</DialogTitle></DialogHeader>
          <form action={createInvoice} className="space-y-4">
            <div className="space-y-2"><Label>Company *</Label>
              <select name="client_id" required className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="">Select...</option>
                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.company_legal_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Invoice Number *</Label><Input name="invoice_number" required /></div>
              <div className="space-y-2"><Label>Amount *</Label><Input name="amount" type="number" step="0.01" required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Invoice Date *</Label><Input name="invoice_date" type="date" required /></div>
              <div className="space-y-2"><Label>Due Date *</Label><Input name="due_date" type="date" required /></div>
            </div>
            <Button type="submit" className="w-full bg-[#C41E3A] hover:bg-[#A51830] text-white">Create Invoice</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}