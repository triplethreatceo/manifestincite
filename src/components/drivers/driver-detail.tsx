'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, AlertTriangle, FileText, Shield, Pill, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import type { AppRole } from '@/lib/types/auth';

const severityBadge: Record<string, string> = {
  critical: 'bg-status-red text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-status-yellow text-black',
  low: 'bg-blue-100 text-blue-800',
};

function ExpirationBadge({ date }: { date: string | null }) {
  if (!date) return <Badge variant="outline" className="text-status-gray">Not on file</Badge>;
  const days = differenceInDays(new Date(date), new Date());
  if (days <= 0) return <Badge className="bg-status-red text-white">Expired</Badge>;
  if (days <= 7) return <Badge className="bg-orange-500 text-white">{days}d left</Badge>;
  if (days <= 30) return <Badge className="bg-status-yellow text-black">{days}d left</Badge>;
  return <Badge className="bg-status-green/10 text-status-green">Valid</Badge>;
}

interface Props {
  driver: any;
  documents: any[];
  alerts: any[];
  drugRecords: any[];
  clearinghouseRecords: any[];
  userRole: AppRole;
}

export function DriverDetail({ driver, documents, alerts, drugRecords, clearinghouseRecords, userRole }: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete driver "${driver.full_name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/drivers/${driver.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? 'Failed to delete driver');
      return;
    }
    toast.success('Driver deleted');
    router.push('/drivers');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/drivers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{driver.full_name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <Link href={`/clients/${driver.client_id}`} className="hover:underline">
                {driver.clients?.company_legal_name}
              </Link>
              <Badge variant="secondary">{driver.status}</Badge>
            </div>
          </div>
        </div>
        {userRole !== 'client' && (
          <div className="flex items-center gap-2">
            <Link href={`/drivers/${driver.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />Edit
              </Button>
            </Link>
            {userRole === 'admin' && (
              <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Compliance Quick View */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <ComplianceCard label="CDL" date={driver.cdl_expiration_date} />
        <ComplianceCard label="Medical Card" date={driver.medical_card_expiration_date} />
        <ComplianceCard label="MVR" date={driver.mvr_date} isRecurring />
        <ComplianceCard label="Drug Test" date={driver.drug_test_date} isRecurring />
        <ComplianceCard label="Background" date={driver.background_check_date} isRecurring />
        <ComplianceCard label="Clearinghouse" date={driver.clearinghouse_query_date} isRecurring />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="testing">Drug & Alcohol</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Driver Info</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="Phone" value={driver.phone} />
                <InfoRow label="Email" value={driver.email} />
                <InfoRow label="CDL Number" value={driver.cdl_number} />
                <InfoRow label="CDL State" value={driver.cdl_state} />
                <InfoRow label="Assigned Vehicle" value={driver.vehicles ? `${driver.vehicles.unit_number ?? ''} ${driver.vehicles.make ?? ''} ${driver.vehicles.model ?? ''}`.trim() : null} />
                <InfoRow label="Application Status" value={driver.employment_application_status} />
                <InfoRow label="DQ File Status" value={driver.driver_qualification_file_status} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Key Dates</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <DateRow label="CDL Expiration" date={driver.cdl_expiration_date} />
                <DateRow label="Medical Card Exp" date={driver.medical_card_expiration_date} />
                <DateRow label="Last MVR" date={driver.mvr_date} />
                <DateRow label="Last Background Check" date={driver.background_check_date} />
                <DateRow label="Last Drug Test" date={driver.drug_test_date} />
                <DateRow label="Last Clearinghouse Query" date={driver.clearinghouse_query_date} />
              </CardContent>
            </Card>
          </div>
          {driver.notes && (
            <Card className="mt-4">
              <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{driver.notes}</p></CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground"><FileText className="h-6 w-6 mx-auto mb-1 opacity-30" />No documents</TableCell></TableRow>
                  ) : (
                    documents.map((doc: any) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.document_name}</TableCell>
                        <TableCell>{doc.category}</TableCell>
                        <TableCell>{doc.users?.full_name ?? '—'}</TableCell>
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
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardContent className="pt-6">
              {alerts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Shield className="h-6 w-6 mx-auto mb-1 opacity-30" />
                  <p className="text-sm">No open alerts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((a: any) => (
                    <div key={a.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.description}</p>
                      </div>
                      <Badge className={severityBadge[a.severity]} variant="secondary">{a.severity}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Pill className="h-4 w-4" />Drug & Alcohol Records</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drugRecords.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No records</TableCell></TableRow>
                    ) : (
                      drugRecords.map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell>{format(new Date(r.test_date), 'MM/dd/yyyy')}</TableCell>
                          <TableCell>{r.test_type}</TableCell>
                          <TableCell>{r.result ?? '—'}</TableCell>
                          <TableCell>{r.status ?? '—'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Clearinghouse Records</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clearinghouseRecords.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">No records</TableCell></TableRow>
                    ) : (
                      clearinghouseRecords.map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell>{format(new Date(r.query_date), 'MM/dd/yyyy')}</TableCell>
                          <TableCell>{r.query_type}</TableCell>
                          <TableCell>{r.result ?? '—'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ComplianceCard({ label, date, isRecurring }: { label: string; date: string | null; isRecurring?: boolean }) {
  return (
    <Card>
      <CardContent className="pt-3 pb-2 px-3">
        <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-medium mb-1">
          {date ? format(new Date(date), 'MM/dd/yy') : '—'}
        </p>
        <ExpirationBadge date={isRecurring ? null : date} />
        {isRecurring && date && (
          <Badge variant="outline" className="text-[10px]">
            {differenceInDays(new Date(), new Date(date)) > 365 ? 'Overdue' : 'Current'}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value ?? '—'}</span>
    </div>
  );
}

function DateRow({ label, date }: { label: string; date: string | null }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium">{date ? format(new Date(date), 'MM/dd/yyyy') : '—'}</span>
      </div>
    </div>
  );
}