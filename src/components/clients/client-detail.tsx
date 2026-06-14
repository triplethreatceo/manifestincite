'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft, Edit, Users, Truck, FileText, AlertTriangle, Receipt,
} from 'lucide-react';
import { format } from 'date-fns';
import type { AppRole } from '@/lib/types/auth';
import type { DbClient, DbDriver, DbVehicle, DbAlert, DbInvoice, DbDocument } from '@/lib/types/database';

const complianceBadge: Record<string, string> = {
  green: 'bg-status-green/10 text-status-green',
  yellow: 'bg-status-yellow/10 text-status-yellow',
  red: 'bg-status-red/10 text-status-red',
  gray: 'bg-status-gray/10 text-status-gray',
};

const severityBadge: Record<string, string> = {
  critical: 'bg-status-red text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-status-yellow text-black',
  low: 'bg-blue-100 text-blue-800',
};

interface Props {
  client: DbClient;
  drivers: DbDriver[];
  vehicles: DbVehicle[];
  alerts: DbAlert[];
  invoices: DbInvoice[];
  documents: DbDocument[];
  userRole: AppRole;
}

export function ClientDetail({ client, drivers, vehicles, alerts, invoices, documents, userRole }: Props) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/clients')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{client.company_legal_name}</h1>
            <div className="flex items-center gap-3 mt-1">
              {client.dot_number && (
                <span className="text-sm text-muted-foreground">DOT# {client.dot_number}</span>
              )}
              {client.mc_number && (
                <span className="text-sm text-muted-foreground">MC# {client.mc_number}</span>
              )}
              <Badge className={complianceBadge[client.compliance_status]} variant="secondary">
                {client.compliance_status}
              </Badge>
            </div>
          </div>
        </div>
        {userRole === 'admin' && (
          <Link href={`/clients/${client.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm">Drivers</span>
            </div>
            <p className="text-2xl font-bold mt-1">{drivers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck className="h-4 w-4" />
              <span className="text-sm">Vehicles</span>
            </div>
            <p className="text-2xl font-bold mt-1">{vehicles.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Open Alerts</span>
            </div>
            <p className="text-2xl font-bold mt-1">{alerts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Documents</span>
            </div>
            <p className="text-2xl font-bold mt-1">{documents.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="drivers">Drivers ({drivers.length})</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles ({vehicles.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Company Info</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {client.dba_name && <InfoRow label="DBA" value={client.dba_name} />}
                {client.ein && <InfoRow label="EIN" value={client.ein} />}
                {client.business_address && <InfoRow label="Business Address" value={client.business_address} />}
                {client.mailing_address && <InfoRow label="Mailing Address" value={client.mailing_address} />}
                <InfoRow label="Status" value={client.status} />
                {client.start_date && <InfoRow label="Start Date" value={format(new Date(client.start_date), 'MMM d, yyyy')} />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Contact & Billing</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {client.contact_person && <InfoRow label="Contact" value={client.contact_person} />}
                {client.phone && <InfoRow label="Phone" value={client.phone} />}
                {client.email && <InfoRow label="Email" value={client.email} />}
                <InfoRow label="Monthly Fee" value={client.monthly_service_fee ? `$${Number(client.monthly_service_fee).toFixed(2)}` : 'Not set'} />
                {client.white_label_partner && <InfoRow label="Partner" value={client.white_label_partner} />}
              </CardContent>
            </Card>
          </div>
          {client.internal_notes && (
            <Card className="mt-4">
              <CardHeader><CardTitle className="text-base">Internal Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{client.internal_notes}</p></CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="drivers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Drivers</CardTitle>
              {(userRole === 'admin' || userRole === 'staff') && (
                <Link href={`/drivers/new?client_id=${client.id}`}>
                  <Button size="sm" className="bg-[#C41E3A] hover:bg-[#A51830] text-white">Add Driver</Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>CDL #</TableHead>
                    <TableHead>CDL Exp</TableHead>
                    <TableHead>Medical Exp</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <Link href={`/drivers/${d.id}`} className="font-medium text-primary hover:underline">{d.full_name}</Link>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{d.cdl_number ?? '—'}</TableCell>
                      <TableCell>{d.cdl_expiration_date ? format(new Date(d.cdl_expiration_date), 'MM/dd/yyyy') : '—'}</TableCell>
                      <TableCell>{d.medical_card_expiration_date ? format(new Date(d.medical_card_expiration_date), 'MM/dd/yyyy') : '—'}</TableCell>
                      <TableCell><Badge variant="secondary">{d.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {drivers.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No drivers</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Vehicles</CardTitle>
              {(userRole === 'admin' || userRole === 'staff') && (
                <Link href={`/vehicles/new?client_id=${client.id}`}>
                  <Button size="sm" className="bg-[#C41E3A] hover:bg-[#A51830] text-white">Add Vehicle</Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit #</TableHead>
                    <TableHead>Year/Make/Model</TableHead>
                    <TableHead>VIN</TableHead>
                    <TableHead>Reg Exp</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>
                        <Link href={`/vehicles/${v.id}`} className="font-medium text-primary hover:underline">{v.unit_number ?? '—'}</Link>
                      </TableCell>
                      <TableCell>{[v.year, v.make, v.model].filter(Boolean).join(' ') || '—'}</TableCell>
                      <TableCell className="font-mono text-xs">{v.vin ?? '—'}</TableCell>
                      <TableCell>{v.registration_expiration_date ? format(new Date(v.registration_expiration_date), 'MM/dd/yyyy') : '—'}</TableCell>
                      <TableCell><Badge variant="secondary">{v.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {vehicles.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No vehicles</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc: any) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.document_name}</TableCell>
                      <TableCell>{doc.category}</TableCell>
                      <TableCell>{doc.users?.full_name ?? '—'}</TableCell>
                      <TableCell>{format(new Date(doc.created_at), 'MM/dd/yyyy')}</TableCell>
                      <TableCell><Badge variant="secondary">{doc.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {documents.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No documents</TableCell></TableRow>
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
                <p className="text-center text-muted-foreground py-6">No open alerts</p>
              ) : (
                <div className="space-y-3">
                  {alerts.map((a) => (
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

        <TabsContent value="invoices">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                      <TableCell>{format(new Date(inv.invoice_date), 'MM/dd/yyyy')}</TableCell>
                      <TableCell>{format(new Date(inv.due_date), 'MM/dd/yyyy')}</TableCell>
                      <TableCell>${Number(inv.amount).toFixed(2)}</TableCell>
                      <TableCell>${Number(inv.balance).toFixed(2)}</TableCell>
                      <TableCell><Badge variant="secondary">{inv.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {invoices.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No invoices</TableCell></TableRow>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}