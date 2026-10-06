'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Truck, FileText, MessageSquare, Clock, Send, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusColor: Record<string, string> = {
  created: 'bg-status-gray/10 text-status-gray',
  assigned: 'bg-blue-100 text-blue-800',
  accepted: 'bg-blue-100 text-blue-800',
  en_route_pickup: 'bg-status-yellow/10 text-status-yellow',
  at_pickup: 'bg-status-yellow/10 text-status-yellow',
  loaded: 'bg-orange-100 text-orange-700',
  in_transit: 'bg-[#C41E3A]/10 text-[#C41E3A]',
  at_delivery: 'bg-status-green/10 text-status-green',
  delivered: 'bg-status-green/10 text-status-green',
  completed: 'bg-status-green/10 text-status-green',
  cancelled: 'bg-status-red/10 text-status-red',
};

const statusFlow = [
  'created', 'assigned', 'accepted', 'en_route_pickup', 'at_pickup',
  'loaded', 'in_transit', 'at_delivery', 'delivered', 'completed',
];

const docTypeLabel: Record<string, string> = {
  rate_confirmation: 'Rate Confirmation',
  bill_of_lading: 'Bill of Lading',
  proof_of_delivery: 'Proof of Delivery',
  invoice: 'Invoice',
  lumper_receipt: 'Lumper Receipt',
  scale_ticket: 'Scale Ticket',
  other: 'Other',
};

function formatStatus(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

import type { AppRole } from '@/lib/types/auth';

interface Props {
  load: any;
  statusUpdates: any[];
  documents: any[];
  messages: any[];
  userId: string;
  userRole: AppRole;
}

export function LoadDetail({ load, statusUpdates, documents, messages, userId, userRole }: Props) {
  const isAdmin = userRole === 'admin';
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const currentIdx = statusFlow.indexOf(load.status);
  const nextStatus = currentIdx >= 0 && currentIdx < statusFlow.length - 1 ? statusFlow[currentIdx + 1] : null;

  async function handleDelete() {
    if (!confirm(`Delete load "${load.load_number}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/dispatch/loads/${load.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error ?? 'Failed to delete load');
      return;
    }
    toast.success('Load deleted');
    router.push('/dispatch/loads');
  }

  async function advanceStatus() {
    if (!nextStatus) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/dispatch/loads/${load.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, updated_by: userId }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Status updated to ${formatStatus(nextStatus)}`);
      router.refresh();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/dispatch/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          load_id: load.id,
          client_id: load.client_id,
          driver_id: load.driver_id,
          sender_id: userId,
          body: messageText.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      setMessageText('');
      router.refresh();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dispatch/loads"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold font-mono">{load.load_number}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <Link href={`/clients/${load.client_id}`} className="hover:underline">{load.clients?.company_legal_name}</Link>
              <Badge className={statusColor[load.status]} variant="secondary">{formatStatus(load.status)}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dispatch/loads/${load.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />Edit
            </Button>
          </Link>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />Delete
            </Button>
          )}
          {nextStatus && load.status !== 'cancelled' && (
            <Button onClick={advanceStatus} disabled={updating} className="bg-[#C41E3A] hover:bg-[#A51830] text-white">
              {updating ? 'Updating...' : `→ ${formatStatus(nextStatus)}`}
            </Button>
          )}
        </div>
      </div>

      {/* Status Pipeline */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-1 overflow-x-auto">
            {statusFlow.map((s, i) => {
              const isCurrent = s === load.status;
              const isPast = i < currentIdx;
              return (
                <div key={s} className="flex items-center gap-1 shrink-0">
                  <div className={`px-2 py-1 rounded text-[10px] font-medium ${isCurrent ? 'bg-[#C41E3A] text-white' : isPast ? 'bg-status-green/10 text-status-green' : 'bg-muted text-muted-foreground'}`}>
                    {formatStatus(s)}
                  </div>
                  {i < statusFlow.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Route & Assignment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium"><MapPin className="h-3.5 w-3.5" />ORIGIN</div>
            <p className="font-medium">{load.origin_name}</p>
            <p className="text-muted-foreground">{load.origin_address}</p>
            <p className="text-muted-foreground">{load.origin_city}, {load.origin_state} {load.origin_zip}</p>
            <p className="text-xs mt-2">Pickup: {format(new Date(load.pickup_date), 'MM/dd/yyyy')}
              {load.pickup_window_start && ` ${load.pickup_window_start}`}
              {load.pickup_window_end && `–${load.pickup_window_end}`}
            </p>
            {load.shipping_hours && <p className="text-xs text-muted-foreground">Shipping: {load.shipping_hours}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium"><MapPin className="h-3.5 w-3.5" />DESTINATION</div>
            <p className="font-medium">{load.destination_name}</p>
            <p className="text-muted-foreground">{load.destination_address}</p>
            <p className="text-muted-foreground">{load.destination_city}, {load.destination_state} {load.destination_zip}</p>
            {load.delivery_date && (
              <p className="text-xs mt-2">Delivery: {format(new Date(load.delivery_date), 'MM/dd/yyyy')}
                {load.delivery_window_start && ` ${load.delivery_window_start}`}
                {load.delivery_window_end && `–${load.delivery_window_end}`}
              </p>
            )}
            {load.receiving_hours && <p className="text-xs text-muted-foreground">Receiving: {load.receiving_hours}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium"><Truck className="h-3.5 w-3.5" />{isAdmin ? 'ASSIGNMENT & FINANCIALS' : 'ASSIGNMENT'}</div>
            <InfoRow label="Driver" value={load.drivers?.full_name} />
            <InfoRow label="Vehicle" value={load.vehicles ? `Unit ${load.vehicles.unit_number ?? ''} ${load.vehicles.make ?? ''}`.trim() : null} />
            <InfoRow label="Dispatcher" value={load.users?.full_name} />
            <InfoRow label="Broker" value={load.broker_name} />
            <div className="border-t pt-2 mt-2" />
            {isAdmin && <InfoRow label="Rate" value={load.rate ? `$${Number(load.rate).toFixed(2)}` : null} />}
            <InfoRow label="Miles" value={load.miles?.toString()} />
            <InfoRow label="DH Miles" value={load.deadhead_miles?.toString()} />
            {isAdmin && <InfoRow label="RPM" value={load.rate_per_mile ? `$${Number(load.rate_per_mile).toFixed(2)}` : null} />}
            {isAdmin && <InfoRow label="Dispatch Fee" value={load.dispatch_fee_amount ? `$${Number(load.dispatch_fee_amount).toFixed(2)} (${load.dispatch_fee_percent}%)` : null} />}
            {isAdmin && <InfoRow label="Driver Pay" value={load.driver_pay ? `$${Number(load.driver_pay).toFixed(2)}` : null} />}
          </CardContent>
        </Card>
      </div>

      {/* Workflow Flags */}
      <div className="flex gap-3 flex-wrap">
        <Badge variant={load.rate_con_received ? 'default' : 'outline'} className={load.rate_con_received ? 'bg-status-green/10 text-status-green' : ''}>
          Rate Con {load.rate_con_received ? '✓' : '—'}
        </Badge>
        <Badge variant={load.bol_submitted ? 'default' : 'outline'} className={load.bol_submitted ? 'bg-status-green/10 text-status-green' : ''}>
          BOL {load.bol_submitted ? '✓' : '—'}
        </Badge>
        <Badge variant={load.invoiced ? 'default' : 'outline'} className={load.invoiced ? 'bg-status-green/10 text-status-green' : ''}>
          Invoiced {load.invoiced ? '✓' : '—'}
        </Badge>
        {load.equipment_type && <Badge variant="outline">{load.equipment_type}</Badge>}
        {load.freight_type && <Badge variant="outline">{load.freight_type}</Badge>}
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline ({statusUpdates.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="messages">Messages ({messages.length})</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardContent className="pt-6">
              {statusUpdates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6"><Clock className="h-6 w-6 mx-auto mb-1 opacity-30" />No status updates yet</p>
              ) : (
                <div className="space-y-4">
                  {statusUpdates.map((u) => (
                    <div key={u.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#C41E3A] mt-1.5" />
                        <div className="w-px flex-1 bg-border" />
                      </div>
                      <div className="pb-4">
                        <div className="flex items-center gap-2">
                          <Badge className={statusColor[u.status] ?? ''} variant="secondary">{formatStatus(u.status)}</Badge>
                          <span className="text-xs text-muted-foreground">{format(new Date(u.created_at), 'MM/dd/yyyy h:mm a')}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">by {u.users?.full_name}</p>
                        {u.location && <p className="text-xs text-muted-foreground">Location: {u.location}</p>}
                        {u.notes && <p className="text-sm mt-1">{u.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                    <TableHead>Type</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground"><FileText className="h-6 w-6 mx-auto mb-1 opacity-30" />No documents</TableCell></TableRow>
                  ) : (
                    documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.document_name}</TableCell>
                        <TableCell><Badge variant="outline">{docTypeLabel[doc.document_type] ?? doc.document_type}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{doc.users?.full_name ?? '—'}</TableCell>
                        <TableCell className="text-xs">{format(new Date(doc.created_at), 'MM/dd/yyyy h:mm a')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6"><MessageSquare className="h-6 w-6 mx-auto mb-1 opacity-30" />No messages yet</p>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender_id === userId;
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-lg px-3 py-2 ${isMe ? 'bg-[#C41E3A] text-white' : 'bg-muted'}`}>
                          <p className={`text-xs font-medium mb-0.5 ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>{m.users?.full_name}</p>
                          <p className="text-sm">{m.body}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? 'text-white/50' : 'text-muted-foreground'}`}>{format(new Date(m.created_at), 'h:mm a')}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <form onSubmit={sendMessage} className="flex gap-2">
                <Input value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type a message..." className="flex-1" />
                <Button type="submit" disabled={sending || !messageText.trim()} size="icon" className="bg-[#C41E3A] hover:bg-[#A51830] text-white">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardContent className="pt-6 space-y-3 text-sm">
              <InfoRow label="Commodity" value={load.commodity} />
              <InfoRow label="Weight" value={load.weight ? `${load.weight.toLocaleString()} lbs` : null} />
              <InfoRow label="Rate Type" value={load.rate_type} />
              <InfoRow label="Reference Numbers" value={load.reference_numbers} />
              {load.special_instructions && (
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground text-xs mb-1">Special Instructions</p>
                  <p className="text-sm whitespace-pre-wrap">{load.special_instructions}</p>
                </div>
              )}
              {load.notes && (
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground text-xs mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{load.notes}</p>
                </div>
              )}
              {load.actual_pickup_time && <InfoRow label="Actual Pickup" value={format(new Date(load.actual_pickup_time), 'MM/dd/yyyy h:mm a')} />}
              {load.actual_delivery_time && <InfoRow label="Actual Delivery" value={format(new Date(load.actual_delivery_time), 'MM/dd/yyyy h:mm a')} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
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