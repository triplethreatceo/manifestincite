import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/get-auth-user';
import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default async function PortalDocumentsPage() {
  const user = await getAuthUser();
  if (!user || !user.clientId) redirect('/login');

  const admin = createAdminClient();
  const { data: documents } = await admin
    .from('documents')
    .select('*')
    .eq('client_id', user.clientId)
    .eq('visibility', 'client_visible')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Documents</h1>
      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(documents ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No documents available</TableCell></TableRow>
              ) : (
                (documents ?? []).map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.document_name}</TableCell>
                    <TableCell>{doc.category}</TableCell>
                    <TableCell>{format(new Date(doc.created_at), 'MM/dd/yyyy')}</TableCell>
                    <TableCell>{doc.expiration_date ? format(new Date(doc.expiration_date), 'MM/dd/yyyy') : '—'}</TableCell>
                    <TableCell><Badge variant="secondary">{doc.status}</Badge></TableCell>
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