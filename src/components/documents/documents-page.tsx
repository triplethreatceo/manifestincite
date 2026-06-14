'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { DOCUMENT_CATEGORIES } from '@/lib/types/auth';
import type { AppRole } from '@/lib/types/auth';
import { DocumentUploadDialog } from './document-upload-dialog';

const statusColor: Record<string, string> = {
  current: 'bg-status-green/10 text-status-green',
  expired: 'bg-status-red/10 text-status-red',
  missing: 'bg-status-yellow/10 text-status-yellow',
  replaced: 'bg-status-gray/10 text-status-gray',
};

interface Props {
  documents: any[];
  clients: { id: string; company_legal_name: string }[];
  userRole: AppRole;
  userId: string;
}

export function DocumentsPage({ documents, clients, userRole, userId }: Props) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered = documents.filter((d) => {
    const matchesSearch =
      d.document_name.toLowerCase().includes(search.toLowerCase()) ||
      d.clients?.company_legal_name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || d.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-sm text-muted-foreground">{documents.length} documents</p>
        </div>
        {userRole !== 'client' && (
          <Button onClick={() => setUploadOpen(true)} className="bg-[#C41E3A] hover:bg-[#A51830] text-white">
            <Upload className="h-4 w-4 mr-2" />Upload Document
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? 'all')}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />No documents found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.document_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{doc.clients?.company_legal_name ?? '—'}</TableCell>
                    <TableCell><Badge variant="outline">{doc.category}</Badge></TableCell>
                    <TableCell className="text-sm">{doc.users?.full_name ?? '—'}</TableCell>
                    <TableCell className="text-sm">{format(new Date(doc.created_at), 'MM/dd/yyyy')}</TableCell>
                    <TableCell className="text-sm">{doc.expiration_date ? format(new Date(doc.expiration_date), 'MM/dd/yyyy') : '—'}</TableCell>
                    <TableCell><Badge className={statusColor[doc.status]} variant="secondary">{doc.status}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{doc.visibility === 'client_visible' ? 'Client' : 'Admin'}</Badge></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DocumentUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        clients={clients}
        userId={userId}
      />
    </div>
  );
}