'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, ArrowLeft, Plus } from 'lucide-react';
import { format } from 'date-fns';

const statusColor: Record<string, string> = {
  created: 'bg-status-gray/10 text-status-gray',
  assigned: 'bg-blue-100 text-blue-800',
  accepted: 'bg-blue-100 text-blue-800',
  en_route_pickup: 'bg-status-yellow/10 text-status-yellow',
  at_pickup: 'bg-status-yellow/10 text-status-yellow',
  loaded: 'bg-orange-100 text-orange-700',
  in_transit: 'bg-[#C41E3A]/10 text-[#C41E3A]',
  at_delivery: 'bg-status-green/10 text-status-green',
  delivered: 'bg-status-green/10 text-status-green',
  completed: 'bg-status-green/10 text-status-green',
  cancelled: 'bg-status-red/10 text-status-red',
};

function formatStatus(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Props {
  loads: any[];
}

export function DispatchLoadsPage({ loads }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = loads.filter((l) => {
    const matchesSearch = l.load_number.toLowerCase().includes(search.toLowerCase()) ||
      l.origin_city?.toLowerCase().includes(search.toLowerCase()) ||
      l.destination_city?.toLowerCase().includes(search.toLowerCase()) ||
      l.drivers?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.clients?.company_legal_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dispatch"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold">All Loads</h1>
            <p className="text-sm text-muted-foreground">{loads.length} total loads</p>
          </div>
        </div>
        <Link href="/dispatch/loads/new">
          <Button className="bg-[#C41E3A] hover:bg-[#A51830] text-white"><Plus className="h-4 w-4 mr-2" />New Load</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search load #, city, driver, or company..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="en_route_pickup">En Route Pickup</SelectItem>
            <SelectItem value="at_pickup">At Pickup</SelectItem>
            <SelectItem value="loaded">Loaded</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="at_delivery">At Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Load #</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Pickup</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-6 text-muted-foreground">No loads found</TableCell></TableRow>
              ) : (
                filtered.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <Link href={`/dispatch/loads/${l.id}`} className="font-medium font-mono text-sm hover:underline">{l.load_number}</Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{l.clients?.company_legal_name}</TableCell>
                    <TableCell className="text-xs">{l.origin_city}, {l.origin_state}</TableCell>
                    <TableCell className="text-xs">{l.destination_city}, {l.destination_state}</TableCell>
                    <TableCell className="text-sm">{l.drivers?.full_name ?? '—'}</TableCell>
                    <TableCell className="text-xs">{format(new Date(l.pickup_date), 'MM/dd/yy')}</TableCell>
                    <TableCell className="text-sm">{l.rate ? `$${Number(l.rate).toFixed(2)}` : '—'}</TableCell>
                    <TableCell><Badge className={statusColor[l.status] ?? ''} variant="secondary">{formatStatus(l.status)}</Badge></TableCell>
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