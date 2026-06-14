'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { AppRole } from '@/lib/types/auth';

const statusColor: Record<string, string> = {
  pending: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-status-yellow/10 text-status-yellow',
  waiting_on_client: 'bg-purple-100 text-purple-800',
  review: 'bg-orange-100 text-orange-800',
  completed: 'bg-status-green/10 text-status-green',
  overdue: 'bg-status-red/10 text-status-red',
};

interface Props {
  tasks: any[];
  clients: { id: string; company_legal_name: string }[];
  staff: { id: string; full_name: string }[];
  userRole: AppRole;
}

export function TasksPage({ tasks, clients, staff, userRole }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.clients?.company_legal_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function createTask(formData: FormData) {
    const body: Record<string, any> = {};
    formData.forEach((v, k) => { body[k] = v === '' ? null : v; });

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success('Task created');
      setDialogOpen(false);
      router.refresh();
    } else {
      toast.error('Failed to create task');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-sm text-muted-foreground">{tasks.filter((t) => t.status !== 'completed').length} open tasks</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-[#C41E3A] hover:bg-[#A51830] text-white">
          <Plus className="h-4 w-4 mr-2" />New Task
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting_on_client">Waiting on Client</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground"><CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />No tasks</TableCell></TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell><p className="font-medium text-sm">{t.title}</p></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.clients?.company_legal_name ?? '—'}</TableCell>
                    <TableCell className="text-sm">{t.users?.full_name ?? 'Unassigned'}</TableCell>
                    <TableCell className="text-sm">{t.due_date ? format(new Date(t.due_date), 'MM/dd/yyyy') : '—'}</TableCell>
                    <TableCell><Badge variant="outline">{t.priority}</Badge></TableCell>
                    <TableCell><Badge className={statusColor[t.status]} variant="secondary">{t.status.replace('_', ' ')}</Badge></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <form action={createTask} className="space-y-4">
            <div className="space-y-2"><Label>Title *</Label><Input name="title" required /></div>
            <div className="space-y-2"><Label>Company *</Label>
              <select name="client_id" required className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="">Select...</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.company_legal_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Assigned To</Label>
                <select name="assigned_staff_id" className="w-full rounded-md border px-3 py-2 text-sm">
                  <option value="">Unassigned</option>
                  {staff.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Due Date</Label><Input name="due_date" type="date" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Priority</Label>
                <select name="priority" defaultValue="medium" className="w-full rounded-md border px-3 py-2 text-sm">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Category</Label><Input name="category" /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea name="description" rows={3} /></div>
            <Button type="submit" className="w-full bg-[#C41E3A] hover:bg-[#A51830] text-white">Create Task</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}