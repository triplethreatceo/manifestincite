'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, ArrowLeft, Plus, BadgeCheck, Star, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const refStatusColor: Record<string, string> = {
  pending: 'bg-status-yellow/10 text-status-yellow',
  confirmed: 'bg-status-green/10 text-status-green',
  disputed: 'bg-status-red/10 text-status-red',
  withdrawn: 'bg-status-gray/10 text-status-gray',
};

interface Props {
  references: any[];
  drivers: any[];
  carriers: any[];
  userId: string;
}

export function VerificationReferencesPage({ references, drivers, carriers, userId }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filtered = references.filter((r) => {
    const matchesSearch = r.drivers?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.clients?.company_legal_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      driver_id: fd.get('driver_id'),
      carrier_id: fd.get('carrier_id'),
      submitted_by: userId,
      employment_start_date: fd.get('employment_start_date'),
      employment_end_date: fd.get('employment_end_date') || null,
      position: fd.get('position'),
      eligible_for_rehire: fd.get('eligible_for_rehire') === 'on' ? true : false,
      performance_rating: fd.get('performance_rating') ? parseInt(fd.get('performance_rating') as string) : null,
      reason_for_leaving: fd.get('reason_for_leaving') || null,
      comments: fd.get('comments') || null,
    };

    try {
      const res = await fetch('/api/verification/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success('Reference submitted');
      setDialogOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to submit reference');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/verification">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Employment References</h1>
            <p className="text-sm text-muted-foreground">Submit and manage employment references for drivers</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-[#C41E3A] hover:bg-[#A51830] text-white">
            <Plus className="h-4 w-4 mr-2" />Submit Reference
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Submit Employment Reference</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Driver *</Label>
                  <select name="driver_id" required className="w-full rounded-md border px-3 py-2 text-sm bg-background">
                    <option value="">Select driver</option>
                    {drivers.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Carrier (submitting) *</Label>
                  <select name="carrier_id" required className="w-full rounded-md border px-3 py-2 text-sm bg-background">
                    <option value="">Select carrier</option>
                    {carriers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_legal_name} {c.carrier_verification_status === 'verified' ? '✓' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Position *</Label>
                <Input name="position" required placeholder="e.g. OTR Driver" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Start Date *</Label>
                  <Input type="date" name="employment_start_date" required />
                </div>
                <div className="space-y-1.5">
                  <Label>End Date</Label>
                  <Input type="date" name="employment_end_date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Performance Rating (1-5)</Label>
                  <Input type="number" name="performance_rating" min={1} max={5} />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch name="eligible_for_rehire" />
                  <Label>Eligible for Rehire</Label>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Reason for Leaving</Label>
                <Input name="reason_for_leaving" placeholder="e.g. Relocated, Better opportunity" />
              </div>
              <div className="space-y-1.5">
                <Label>Comments</Label>
                <Textarea name="comments" rows={2} placeholder="Additional notes about this driver's employment..." />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting} className="bg-[#C41E3A] hover:bg-[#A51830] text-white">
                  {submitting ? 'Submitting...' : 'Submit Reference'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search driver or carrier..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="disputed">Disputed</SelectItem>
            <SelectItem value="withdrawn">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Rehire</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-6 text-muted-foreground"><FileText className="h-6 w-6 mx-auto mb-1 opacity-30" />No references found</TableCell></TableRow>
              ) : (
                filtered.map((ref) => (
                  <TableRow key={ref.id}>
                    <TableCell>
                      <Link href={`/verification/drivers/${ref.driver_id}`} className="font-medium hover:underline">{ref.drivers?.full_name}</Link>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        {ref.clients?.company_legal_name}
                        {ref.verified_carrier_stamp && <BadgeCheck className="h-3.5 w-3.5 text-status-green" />}
                      </span>
                    </TableCell>
                    <TableCell>{ref.position}</TableCell>
                    <TableCell className="text-xs">
                      {format(new Date(ref.employment_start_date), 'MM/yyyy')} — {ref.employment_end_date ? format(new Date(ref.employment_end_date), 'MM/yyyy') : 'Present'}
                    </TableCell>
                    <TableCell>{ref.eligible_for_rehire === null ? '—' : ref.eligible_for_rehire ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      {ref.performance_rating ? (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: ref.performance_rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-status-yellow text-status-yellow" />
                          ))}
                        </div>
                      ) : '—'}
                    </TableCell>
                    <TableCell><Badge className={refStatusColor[ref.status]} variant="secondary">{ref.status}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{ref.users?.full_name}<br />{format(new Date(ref.created_at), 'MM/dd/yy')}</TableCell>
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