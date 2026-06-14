'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BadgeCheck, Star, ShieldCheck, FileText, ClipboardCheck, Lock } from 'lucide-react';
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
  driver: any;
  references: any[];
  evaluations: any[];
  accessRequests: any[];
  userId: string;
}

export function VerificationDriverDetail({ driver, references, evaluations, accessRequests, userId }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [verStatus, setVerStatus] = useState(driver.verification_status);
  const [visibility, setVisibility] = useState(driver.profile_visibility);

  async function updateVerification() {
    setSaving(true);
    try {
      const res = await fetch(`/api/verification/drivers/${driver.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verification_status: verStatus,
          profile_visibility: visibility,
          ...(verStatus === 'verified' ? { verified_at: new Date().toISOString(), verified_by: userId } : {}),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Verification updated');
      router.refresh();
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/verification/drivers">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {driver.full_name}
              {driver.verification_status === 'verified' && <BadgeCheck className="h-5 w-5 text-status-green" />}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <Link href={`/clients/${driver.client_id}`} className="hover:underline">{driver.clients?.company_legal_name}</Link>
              <Badge className={verificationColor[driver.verification_status]} variant="secondary">{driver.verification_status}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Controls */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Verification Controls</CardTitle></CardHeader>
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
              <p className="text-sm font-medium">Profile Visibility</p>
              <Select value={visibility} onValueChange={(v) => setVisibility(v ?? 'private')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="verified_carriers">Verified Carriers Only</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={updateVerification} disabled={saving} className="bg-[#C41E3A] hover:bg-[#A51830] text-white">
              {saving ? 'Saving...' : 'Update'}
            </Button>
          </div>
          {driver.verified_at && (
            <p className="text-xs text-muted-foreground mt-3">
              Verified on {format(new Date(driver.verified_at), 'MMM d, yyyy')}
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="references">References ({references.length})</TabsTrigger>
          <TabsTrigger value="evaluations">Evaluations ({evaluations.length})</TabsTrigger>
          <TabsTrigger value="access">Access Requests ({accessRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Driver Info</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="CDL Number" value={driver.cdl_number} />
                <InfoRow label="CDL State" value={driver.cdl_state} />
                <InfoRow label="CDL Expiration" value={driver.cdl_expiration_date ? format(new Date(driver.cdl_expiration_date), 'MM/dd/yyyy') : null} />
                <InfoRow label="Years Experience" value={driver.years_experience?.toString()} />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Endorsements</span>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {driver.endorsements?.length > 0
                      ? driver.endorsements.map((e: string) => <Badge key={e} variant="outline" className="text-[10px]">{e}</Badge>)
                      : <span className="font-medium">—</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <InfoRow label="Email" value={driver.email} />
                <InfoRow label="Phone" value={driver.phone} />
                <InfoRow label="Visibility" value={driver.profile_visibility} />
                <InfoRow label="Status" value={driver.status} />
                {driver.profile_bio && (
                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground text-xs mb-1">Bio</p>
                    <p className="text-sm">{driver.profile_bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="references">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Rehire</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {references.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground"><FileText className="h-6 w-6 mx-auto mb-1 opacity-30" />No references</TableCell></TableRow>
                  ) : (
                    references.map((ref: any) => (
                      <TableRow key={ref.id}>
                        <TableCell className="font-medium">
                          {ref.clients?.company_legal_name}
                          {ref.verified_carrier_stamp && <BadgeCheck className="inline h-3.5 w-3.5 ml-1 text-status-green" />}
                        </TableCell>
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
                        <TableCell className="text-xs text-muted-foreground">{ref.users?.full_name ?? '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluations">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Decision</TableHead>
                    <TableHead>Evaluated By</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluations.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground"><ClipboardCheck className="h-6 w-6 mx-auto mb-1 opacity-30" />No evaluations</TableCell></TableRow>
                  ) : (
                    evaluations.map((ev: any) => (
                      <TableRow key={ev.id}>
                        <TableCell className="font-medium">{ev.clients?.company_legal_name}</TableCell>
                        <TableCell><Badge variant="secondary">{ev.decision?.replace('_', ' ')}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{ev.users?.full_name ?? '—'}</TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{ev.notes ?? '—'}</TableCell>
                        <TableCell className="text-xs">{format(new Date(ev.created_at), 'MM/dd/yyyy')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Responded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessRequests.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground"><Lock className="h-6 w-6 mx-auto mb-1 opacity-30" />No access requests</TableCell></TableRow>
                  ) : (
                    accessRequests.map((req: any) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.clients?.company_legal_name}</TableCell>
                        <TableCell><Badge variant="secondary">{req.status}</Badge></TableCell>
                        <TableCell className="text-xs">{format(new Date(req.created_at), 'MM/dd/yyyy')}</TableCell>
                        <TableCell className="text-xs">{req.responded_at ? format(new Date(req.responded_at), 'MM/dd/yyyy') : '—'}</TableCell>
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