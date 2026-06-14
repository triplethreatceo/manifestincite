'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Truck } from 'lucide-react';
import { format } from 'date-fns';
import type { AppRole } from '@/lib/types/auth';

interface Props {
  vehicles: any[];
  clients: { id: string; company_legal_name: string }[];
  userRole: AppRole;
}

export function VehiclesPage({ vehicles, clients, userRole }: Props) {
  const [search, setSearch] = useState('');

  const filtered = vehicles.filter(
    (v) =>
      v.unit_number?.toLowerCase().includes(search.toLowerCase()) ||
      v.vin?.toLowerCase().includes(search.toLowerCase()) ||
      v.make?.toLowerCase().includes(search.toLowerCase()) ||
      v.clients?.company_legal_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vehicles</h1>
          <p className="text-sm text-muted-foreground">{vehicles.length} total vehicles</p>
        </div>
        {userRole !== 'client' && (
          <Link href="/vehicles/new">
            <Button className="bg-[#C41E3A] hover:bg-[#A51830] text-white">
              <Plus className="h-4 w-4 mr-2" />Add Vehicle
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search vehicles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit #</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Year/Make/Model</TableHead>
                <TableHead>VIN</TableHead>
                <TableHead>Reg Exp</TableHead>
                <TableHead>Inspection Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Truck className="h-8 w-8 mx-auto mb-2 opacity-30" />No vehicles found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <Link href={`/vehicles/${v.id}`} className="font-medium text-primary hover:underline">{v.unit_number ?? '—'}</Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{v.clients?.company_legal_name ?? '—'}</TableCell>
                    <TableCell>{[v.year, v.make, v.model].filter(Boolean).join(' ') || '—'}</TableCell>
                    <TableCell className="font-mono text-xs">{v.vin ?? '—'}</TableCell>
                    <TableCell>{v.registration_expiration_date ? format(new Date(v.registration_expiration_date), 'MM/dd/yyyy') : '—'}</TableCell>
                    <TableCell>{v.annual_inspection_due_date ? format(new Date(v.annual_inspection_due_date), 'MM/dd/yyyy') : '—'}</TableCell>
                    <TableCell><Badge variant="secondary">{v.status}</Badge></TableCell>
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