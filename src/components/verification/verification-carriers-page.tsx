'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, BadgeCheck, ArrowLeft } from 'lucide-react';

const verificationColor: Record<string, string> = {
  verified: 'bg-status-green/10 text-status-green',
  pending: 'bg-status-yellow/10 text-status-yellow',
  unverified: 'bg-status-gray/10 text-status-gray',
  rejected: 'bg-status-red/10 text-status-red',
  suspended: 'bg-orange-100 text-orange-700',
};

interface Props {
  carriers: any[];
}

export function VerificationCarriersPage({ carriers }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = carriers.filter((c) => {
    const matchesSearch = c.company_legal_name.toLowerCase().includes(search.toLowerCase()) ||
      c.dot_number?.toLowerCase().includes(search.toLowerCase()) ||
      c.mc_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.carrier_verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/verification">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Carrier Directory</h1>
          <p className="text-sm text-muted-foreground">Verify carriers and manage reference submission rights</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search company, DOT#, or MC#..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>DOT #</TableHead>
                <TableHead>MC #</TableHead>
                <TableHead>Fleet Size</TableHead>
                <TableHead>Safety Rating</TableHead>
                <TableHead>Can Submit Refs</TableHead>
                <TableHead>Verification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No carriers found</TableCell></TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link href={`/verification/carriers/${c.id}`} className="font-medium hover:underline flex items-center gap-1.5">
                        {c.company_legal_name}
                        {c.carrier_verification_status === 'verified' && <BadgeCheck className="h-3.5 w-3.5 text-status-green" />}
                      </Link>
                      {c.dba_name && <p className="text-xs text-muted-foreground">DBA: {c.dba_name}</p>}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{c.dot_number ?? '—'}</TableCell>
                    <TableCell className="font-mono text-xs">{c.mc_number ?? '—'}</TableCell>
                    <TableCell>{c.fleet_size ?? '—'}</TableCell>
                    <TableCell>{c.safety_rating ?? '—'}</TableCell>
                    <TableCell>
                      {c.can_submit_references
                        ? <Badge className="bg-status-green/10 text-status-green" variant="secondary">Yes</Badge>
                        : <Badge variant="outline">No</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge className={verificationColor[c.carrier_verification_status] ?? ''} variant="secondary">
                        {c.carrier_verification_status}
                      </Badge>
                    </TableCell>
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