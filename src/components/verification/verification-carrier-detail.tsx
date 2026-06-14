'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, BadgeCheck, ShieldCheck, FileText, Users, Star } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useState } from 'react';

const verificationColor: Record<string, string> = {
  verified: 'bg-status-green/10 text-status-green',
  pending: 'bg-status-yellow/10 text-status-yellow',
  unverified: 'bg-status-gray/10 text-status-gray',
  rejected: 'bg-status-red/10 text-status-red',
  suspended: 'bg-orange-100 text-orange-700',
};

const refStatusColor: Record<string, string> = {
  pending: 'bg-status-yellow/10 text-status-yellow',
  confirmed: 'bg-status-green/10 text-status-green',
  disputed: 'bg-status-red/10 text-status-red',
  withdrawn: 'bg-status-gray/10 text-status-gray',
};

interface Props {
  carrier: any;
  submittedReferences: any[];
  drivers: any[];
  userId: string;
}

export function VerificationCarrierDetail({ carrier, submittedReferences, drivers, userId }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [verStatus, setVerStatus] = useState(carrier.carrier_verification_status);
  const [canSubmitRefs, setCanSubmitRefs] = useState(carrier.can_submit_references);

  async function updateVerification() {
    setSaving(true);
    try {
      const res = await fetch(`/api/verification/carriers/${carrier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier_verification_status: verStatus,
          can_submit_references: canSubmitRefs,
          ...(verStatus === 'verified' ? { carrier_verified_at: new Date().toISOString(), carrier_verified_by: userId } : {}),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Carrier verification updated');
      router.refresh();
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/verification/carriers">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {carrier.company_legal_name}
              {carrier.carrier_verification_status === 'verified' && <BadgeCheck className="h-5 w-5 text-status-green" />}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              {carrier.dba_name && <span>DBA: {carrier.dba_name}</span>}
              <Badge className={verificationColor[carrier.carrier_verification_status]} variant="secondary">{carrier.carrier_verification_status}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Controls */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Carrier Verification Controls</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-1.5 flex-1">
              <p className="text-sm font-medium">Verification Status</p>
              <Select value={verStatus} onValueChange={(v) => setVerStatus(v ?? 'unverified')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-3">
                <Switch checked={canSubmitRefs} onCheckedChange={setCanSubmitRefs} />
                <Label>Can Submit References</Label>
              </div>
              <p className="text-xs text-muted-foreground">Only verified carriers should submit employment references</p>
            </div>
            <Button onClick={updateVerification} disabled={saving} className="bg-[#C41E3A] hover:bg-[#A51830] text-white">
              {saving ? 'Saving...' : 'Update'}
            </Button>
          </div>
          {carrier.carrier_verified_at && (
            <p className="text-xs text-muted-foreground mt-3">
              Verified on {format(new Date(carrier.carrier_verified_at), 'MMM d, yyyy')}
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Company Info</TabsTrigger>
          <TabsTrigger value="drivers">Drivers ({drivers.length})</TabsTrigger>
          <TabsTrigger value="references">Submitted References ({submittedReferences.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardContent className="pt-6 space-y-3 text-sm">
              <InfoRow label="DOT Number" value={carrier.dot_number} />
              <InfoRow label="MC Number" value={carrier.mc_number} />
              <InfoRow label="EIN" value={carrier.ein} />
              <InfoRow label="Address" value={carrier.business_address} />
              <InfoRow label="Contact" value={carrier.contact_person} />
              <InfoRow label="Phone" value={carrier.phone} />
              <InfoRow label="Email" value={carrier.email} />
              <InfoRow label="Fleet Size" value={carrier.fleet_size?.toString()} />
              <InfoRow label="Years in Business" value={carrier.years_in_business?.toString()} />
              <InfoRow label="Safety Rating" value={carrier.safety_rating} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Verification Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="text-center py-6 text-muted-foreground"><Users className="h-6 w-6 mx-auto mb-1 opacity-30" />No drivers</TableCell></TableRow>
                  ) : (
                    drivers.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell>
                          <Link href={`/verification/drivers/${d.id}`} className="font-medium hover:underline flex items-center gap-1.5">
                            {d.full_name}
                            {d.verification_status === 'verified' && <BadgeCheck className="h-3.5 w-3.5 text-status-green" />}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge className={verificationColor[d.verification_status] ?? ''} variant="secondary">{d.verification_status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="references">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Rehire</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submittedReferences.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground"><FileText className="h-6 w-6 mx-auto mb-1 opacity-30" />No references submitted</TableCell></TableRow>
                  ) : (
                    submittedReferences.map((ref: any) => (
                      <TableRow key={ref.id}>
                        <TableCell className="font-medium">{ref.drivers?.full_name}</TableCell>
                        <TableCell>{ref.position}</TableCell>
                        <TableCell className="text-xs">
                          {format(new Date(ref.employment_start_date), 'MM/yyyy')} — {ref.employment_end_date ? format(new Date(ref.employment_end_date), 'MM/yyyy') : 'Present'}
                        </TableCell>
                        <TableCell>{ref.eligible_for_rehire === null ? '—' : ref.eligible_for_rehire ? 'Yes' : 'No'}</TableCell>
                        <TableCell>
                          {ref.performance_rating ? (
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: ref.performance_rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-status-yellow text-status-yellow" />
                              ))}
                            </div>
                          ) : '—'}
                        </TableCell>
                        <TableCell><Badge className={refStatusColor[ref.status]} variant="secondary">{ref.status}</Badge></TableCell>
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

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value ?? '—'}</span>
    </div>
  );
}