'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Building2 } from 'lucide-react';
import type { AppRole } from '@/lib/types/auth';
import type { DbClient } from '@/lib/types/database';

const statusBadge: Record<string, string> = {
  active: 'bg-status-green/10 text-status-green',
  inactive: 'bg-status-gray/10 text-status-gray',
  suspended: 'bg-status-red/10 text-status-red',
};

const complianceBadge: Record<string, string> = {
  green: 'bg-status-green/10 text-status-green',
  yellow: 'bg-status-yellow/10 text-status-yellow',
  red: 'bg-status-red/10 text-status-red',
  gray: 'bg-status-gray/10 text-status-gray',
};

interface ClientsListProps {
  clients: DbClient[];
  userRole: AppRole;
}

export function ClientsList({ clients, userRole }: ClientsListProps) {
  const [search, setSearch] = useState('');

  const filtered = clients.filter(
    (c) =>
      c.company_legal_name.toLowerCase().includes(search.toLowerCase()) ||
      c.dot_number?.toLowerCase().includes(search.toLowerCase()) ||
      c.dba_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground">{clients.length} trucking companies</p>
        </div>
        {userRole === 'admin' && (
          <Link href="/clients/new">
            <Button className="bg-[#C41E3A] hover:bg-[#A51830] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, DOT#, or DBA..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>DOT #</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead className="text-right">Monthly Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No clients found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {client.company_legal_name}
                      </Link>
                      {client.dba_name && (
                        <p className="text-xs text-muted-foreground">DBA: {client.dba_name}</p>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{client.dot_number ?? '—'}</TableCell>
                    <TableCell>
                      <p className="text-sm">{client.contact_person ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{client.email ?? ''}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadge[client.status]} variant="secondary">
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={complianceBadge[client.compliance_status]} variant="secondary">
                        {client.compliance_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {client.monthly_service_fee
                        ? `$${Number(client.monthly_service_fee).toFixed(2)}`
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}