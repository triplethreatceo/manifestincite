'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { AppRole } from '@/lib/types/auth';

const severityColor: Record<string, string> = {
  critical: 'bg-status-red text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-status-yellow text-black',
  low: 'bg-blue-100 text-blue-800',
};

const statusColor: Record<string, string> = {
  open: 'bg-status-red/10 text-status-red',
  in_progress: 'bg-status-yellow/10 text-status-yellow',
  resolved: 'bg-status-green/10 text-status-green',
  dismissed: 'bg-status-gray/10 text-status-gray',
};

interface Props {
  alerts: any[];
  userRole: AppRole;
}

export function AlertsPage({ alerts, userRole }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = alerts.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.clients?.company_legal_name?.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  async function resolveAlert(id: string) {
    const res = await fetch(`/api/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved', resolved_date: new Date().toISOString() }),
    });
    if (res.ok) {
      toast.success('Alert resolved');
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-sm text-muted-foreground">
          {alerts.filter((a) => a.status === 'open' || a.status === 'in_progress').length} open alerts
        </p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search alerts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v ?? 'all')}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alert</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                {userRole !== 'client' && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />No alerts
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{a.title}</p>
                      {a.description && <p className="text-xs text-muted-foreground truncate max-w-[300px]">{a.description}</p>}
                    </TableCell>
                    <TableCell className="text-sm">{a.clients?.company_legal_name ?? '—'}</TableCell>
                    <TableCell><Badge variant="outline">{a.category}</Badge></TableCell>
                    <TableCell className="text-sm">{a.due_date ? format(new Date(a.due_date), 'MM/dd/yyyy') : '—'}</TableCell>
                    <TableCell><Badge className={severityColor[a.severity]} variant="secondary">{a.severity}</Badge></TableCell>
                    <TableCell><Badge className={statusColor[a.status]} variant="secondary">{a.status}</Badge></TableCell>
                    {userRole !== 'client' && (
                      <TableCell>
                        {(a.status === 'open' || a.status === 'in_progress') && (
                          <Button variant="ghost" size="sm" onClick={() => resolveAlert(a.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    )}
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