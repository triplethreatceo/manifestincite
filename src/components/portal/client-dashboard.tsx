'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Users, Truck, FileText, Receipt, Shield } from 'lucide-react';
import { format } from 'date-fns';

const complianceBadge: Record<string, string> = {
  green: 'bg-status-green text-white',
  yellow: 'bg-status-yellow text-black',
  red: 'bg-status-red text-white',
  gray: 'bg-status-gray text-white',
};

const complianceLabel: Record<string, string> = {
  green: 'Compliant',
  yellow: 'Attention Needed',
  red: 'Urgent Issues',
  gray: 'Inactive',
};

const severityColor: Record<string, string> = {
  critical: 'bg-status-red text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-status-yellow text-black',
  low: 'bg-blue-100 text-blue-800',
};

interface Props {
  client: any;
  alerts: any[];
  drivers: any[];
  vehicles: any[];
  documents: any[];
  invoices: any[];
}

export function ClientDashboard({ client, alerts, drivers, vehicles, documents, invoices }: Props) {
  return (
    <div className="space-y-6">
      {/* Company Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{client.company_legal_name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            {client.dot_number && <span>DOT# {client.dot_number}</span>}
            {client.mc_number && <span>MC# {client.mc_number}</span>}
          </div>
        </div>
        <Badge className={`${complianceBadge[client.compliance_status]} text-sm px-3 py-1`}>
          <Shield className="h-3.5 w-3.5 mr-1.5" />
          {complianceLabel[client.compliance_status]}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground"><AlertTriangle className="h-4 w-4" /><span className="text-sm">Open Alerts</span></div>
            <p className="text-2xl font-bold mt-1">{alerts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /><span className="text-sm">Active Drivers</span></div>
            <p className="text-2xl font-bold mt-1">{drivers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground"><Truck className="h-4 w-4" /><span className="text-sm">Active Vehicles</span></div>
            <p className="text-2xl font-bold mt-1">{vehicles.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground"><FileText className="h-4 w-4" /><span className="text-sm">Documents</span></div>
            <p className="text-2xl font-bold mt-1">{documents.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Open Alerts</CardTitle></CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No alerts — all clear!</p>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 8).map((a) => (
                  <div key={a.id} className="flex items-start justify-between text-sm">
                    <div><p className="font-medium">{a.title}</p><p className="text-xs text-muted-foreground">{a.category}</p></div>
                    <Badge className={severityColor[a.severity]} variant="secondary">{a.severity}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Recent Invoices</CardTitle></CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No invoices</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                      <TableCell className="text-sm">{format(new Date(inv.due_date), 'MM/dd/yyyy')}</TableCell>
                      <TableCell className="text-right">${Number(inv.balance).toFixed(2)}</TableCell>
                      <TableCell><Badge variant="secondary">{inv.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-base">Recent Documents</CardTitle></CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No documents available</p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{doc.document_name}</p>
                      <p className="text-xs text-muted-foreground">{doc.category}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{format(new Date(doc.created_at), 'MMM d, yyyy')}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}