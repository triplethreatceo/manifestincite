'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, AlertTriangle, FileText, Shield, Wrench, Trash2 } from 'lucide-react';
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
  vehicle: any;
  documents: any[];
  alerts: any[];
  maintenanceRecords: any[];
  userRole: AppRole;
}

export function VehicleDetail({ vehicle, documents, alerts, maintenanceRecords, userRole }: Props) {
  const router = useRouter();

  async function handleDelete() {
    const label = vehicle.unit_number ? `Unit ${vehicle.unit_number}` : `${vehicle.make ?? ''} ${vehicle.model ?? ''}`.trim();
    if (!confirm(`Delete vehicle "${label}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/vehicles/${vehicle.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? 'Failed to delete vehicle');
      return;
    }
    toast.success('Vehicle deleted');
    router.push('/vehicles');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/vehicles')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {vehicle.unit_number ? `Unit ${vehicle.unit_number}` : `${vehicle.year ?? ''} ${vehicle.make ?? ''} ${vehicle.model ?? ''}`.trim() || 'Vehicle'}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <Link href={`/clients/${vehicle.client_id}`} className="hover:underline">
                {vehicle.clients?.company_legal_name}
              </Link>
              <Badge variant="secondary">{vehicle.status}</Badge>
            </div>
          </div>
        </div>
        {userRole !== 'client' && (
          <div className="flex items-center gap-2">
            <Link href={`/vehicles/${vehicle.id}/edit`}>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <ComplianceCard label="Registration" date={vehicle.registration_expiration_date} />
        <ComplianceCard label="Insurance" date={vehicle.insurance_expiration_date} />
        <ComplianceCard label="Annual Inspection" date={vehicle.annual_inspection_due_date} />
        <Card>
          <CardContent className="pt-3 pb-2 px-3">
            <p className="text-[11px] text-muted-foreground mb-1">Maintenance</p>
            <p className="text-sm font-medium mb-1">{vehicle.maintenance_status ?? '—'}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Vehicle Info</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="Unit Number" value={vehicle.unit_number} />
                <InfoRow label="VIN" value={vehicle.vin} />
                <InfoRow label="Year" value={vehicle.year?.toString()} />
                <InfoRow label="Make" value={vehicle.make} />
                <InfoRow label="Model" value={vehicle.model} />
                <InfoRow label="Plate Number" value={vehicle.plate_number} />
                <InfoRow label="Registration State" value={vehicle.registration_state} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Key Dates</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <DateRow label="Registration Exp" date={vehicle.registration_expiration_date} />
                <DateRow label="Insurance Exp" date={vehicle.insurance_expiration_date} />
                <DateRow label="Annual Inspection Due" date={vehicle.annual_inspection_due_date} />
              </CardContent>
            </Card>
          </div>
          {vehicle.notes && (
            <Card className="mt-4">
              <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{vehicle.notes}</p></CardContent>
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

        <TabsContent value="maintenance">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4" />Maintenance Records</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceRecords.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No maintenance records</TableCell></TableRow>
                  ) : (
                    maintenanceRecords.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell>{format(new Date(r.service_date), 'MM/dd/yyyy')}</TableCell>
                        <TableCell>{r.service_type}</TableCell>
                        <TableCell>{r.description ?? '—'}</TableCell>
                        <TableCell>{r.vendor ?? '—'}</TableCell>
                        <TableCell>{r.cost ? `$${Number(r.cost).toFixed(2)}` : '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ComplianceCard({ label, date }: { label: string; date: string | null }) {
  return (
    <Card>
      <CardContent className="pt-3 pb-2 px-3">
        <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-medium mb-1">
          {date ? format(new Date(date), 'MM/dd/yy') : '—'}
        </p>
        <ExpirationBadge date={date} />
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