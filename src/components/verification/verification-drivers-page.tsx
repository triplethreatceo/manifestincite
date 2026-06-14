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
  drivers: any[];
}

export function VerificationDriversPage({ drivers }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = drivers.filter((d) => {
    const matchesSearch = d.full_name.toLowerCase().includes(search.toLowerCase()) ||
      d.cdl_number?.toLowerCase().includes(search.toLowerCase()) ||
      d.clients?.company_legal_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/verification">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Driver Verification Profiles</h1>
          <p className="text-sm text-muted-foreground">Manage driver verification status and profiles</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search drivers, CDL, or company..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>CDL</TableHead>
                <TableHead>CDL State</TableHead>
                <TableHead>Endorsements</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Visibility</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No drivers found</TableCell></TableRow>
              ) : (
                filtered.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <Link href={`/verification/drivers/${d.id}`} className="font-medium hover:underline flex items-center gap-1.5">
                        {d.full_name}
                        {d.verification_status === 'verified' && <BadgeCheck className="h-3.5 w-3.5 text-status-green" />}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{d.clients?.company_legal_name}</TableCell>
                    <TableCell className="font-mono text-xs">{d.cdl_number ?? '—'}</TableCell>
                    <TableCell>{d.cdl_state ?? '—'}</TableCell>
                    <TableCell>
                      {d.endorsements?.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {d.endorsements.map((e: string) => (
                            <Badge key={e} variant="outline" className="text-[10px]">{e}</Badge>
                          ))}
                        </div>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge className={verificationColor[d.verification_status] ?? ''} variant="secondary">
                        {d.verification_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{d.profile_visibility}</TableCell>
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