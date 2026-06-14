'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Users } from 'lucide-react';
import { format } from 'date-fns';
import type { AppRole } from '@/lib/types/auth';

interface Props {
  drivers: any[];
  clients: { id: string; company_legal_name: string }[];
  userRole: AppRole;
}

export function DriversPage({ drivers, clients, userRole }: Props) {
  const [search, setSearch] = useState('');

  const filtered = drivers.filter(
    (d) =>
      d.full_name.toLowerCase().includes(search.toLowerCase()) ||
      d.cdl_number?.toLowerCase().includes(search.toLowerCase()) ||
      d.clients?.company_legal_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="text-sm text-muted-foreground">{drivers.length} total drivers</p>
        </div>
        {userRole !== 'client' && (
          <Link href="/drivers/new">
            <Button className="bg-[#C41E3A] hover:bg-[#A51830] text-white">
              <Plus className="h-4 w-4 mr-2" />Add Driver
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search drivers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>CDL #</TableHead>
                <TableHead>CDL Exp</TableHead>
                <TableHead>Medical Exp</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />No drivers found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <Link href={`/drivers/${d.id}`} className="font-medium text-primary hover:underline">{d.full_name}</Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.clients?.company_legal_name ?? '—'}</TableCell>
                    <TableCell className="font-mono text-sm">{d.cdl_number ?? '—'}</TableCell>
                    <TableCell>{d.cdl_expiration_date ? format(new Date(d.cdl_expiration_date), 'MM/dd/yyyy') : '—'}</TableCell>
                    <TableCell>{d.medical_card_expiration_date ? format(new Date(d.medical_card_expiration_date), 'MM/dd/yyyy') : '—'}</TableCell>
                    <TableCell><Badge variant="secondary">{d.status}</Badge></TableCell>
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