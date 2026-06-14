'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BadgeCheck, Users, Building2, FileText, ClipboardCheck } from 'lucide-react';
import { format } from 'date-fns';

const statusColor: Record<string, string> = {
  pending: 'bg-status-yellow/10 text-status-yellow',
  confirmed: 'bg-status-green/10 text-status-green',
  disputed: 'bg-status-red/10 text-status-red',
  withdrawn: 'bg-status-gray/10 text-status-gray',
};

const decisionColor: Record<string, string> = {
  hire: 'bg-status-green/10 text-status-green',
  reject: 'bg-status-red/10 text-status-red',
  hold: 'bg-status-yellow/10 text-status-yellow',
  no_decision: 'bg-status-gray/10 text-status-gray',
};

interface Props {
  stats: {
    verifiedDrivers: number;
    pendingDrivers: number;
    verifiedCarriers: number;
    pendingCarriers: number;
    pendingReferences: number;
    totalReferences: number;
  };
  recentReferences: any[];
  recentEvaluations: any[];
}

export function VerificationDashboard({ stats, recentReferences, recentEvaluations }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Verification Network</h1>
          <p className="text-sm text-muted-foreground">Driver & carrier verification, employment references, hiring tools</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Verified Drivers" value={stats.verifiedDrivers} icon={<BadgeCheck className="h-5 w-5" />} subtitle={`${stats.pendingDrivers} pending`} />
        <StatCard title="Verified Carriers" value={stats.verifiedCarriers} icon={<Building2 className="h-5 w-5" />} subtitle={`${stats.pendingCarriers} pending`} />
        <StatCard title="References" value={stats.totalReferences} icon={<FileText className="h-5 w-5" />} subtitle={`${stats.pendingReferences} pending review`} />
        <StatCard title="Pending Reviews" value={stats.pendingDrivers + stats.pendingCarriers + stats.pendingReferences} icon={<ClipboardCheck className="h-5 w-5" />} variant={stats.pendingDrivers + stats.pendingCarriers + stats.pendingReferences > 0 ? 'warning' : 'default'} />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/verification/drivers">
          <Card className="hover:border-[#C41E3A]/30 transition-colors cursor-pointer">
            <CardContent className="pt-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C41E3A]/10">
                <Users className="h-5 w-5 text-[#C41E3A]" />
              </div>
              <div>
                <p className="font-medium">Driver Profiles</p>
                <p className="text-xs text-muted-foreground">Verify drivers & manage profiles</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/verification/carriers">
          <Card className="hover:border-[#C41E3A]/30 transition-colors cursor-pointer">
            <CardContent className="pt-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C41E3A]/10">
                <Building2 className="h-5 w-5 text-[#C41E3A]" />
              </div>
              <div>
                <p className="font-medium">Carrier Directory</p>
                <p className="text-xs text-muted-foreground">Verify carriers & manage access</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/verification/references">
          <Card className="hover:border-[#C41E3A]/30 transition-colors cursor-pointer">
            <CardContent className="pt-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C41E3A]/10">
                <FileText className="h-5 w-5 text-[#C41E3A]" />
              </div>
              <div>
                <p className="font-medium">Employment References</p>
                <p className="text-xs text-muted-foreground">Submit & review references</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Recent References
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentReferences.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No references submitted yet</p>
            ) : (
              <div className="space-y-3">
                {recentReferences.map((ref: any) => (
                  <div key={ref.id} className="flex items-start justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{ref.drivers?.full_name}</p>
                      <p className="text-xs text-muted-foreground">from {ref.clients?.company_legal_name}</p>
                    </div>
                    <Badge className={statusColor[ref.status] ?? ''} variant="secondary">{ref.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              Recent Evaluations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentEvaluations.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No evaluations recorded yet</p>
            ) : (
              <div className="space-y-3">
                {recentEvaluations.map((ev: any) => (
                  <div key={ev.id} className="flex items-start justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{ev.drivers?.full_name}</p>
                      <p className="text-xs text-muted-foreground">by {ev.clients?.company_legal_name} &middot; {ev.users?.full_name}</p>
                    </div>
                    <Badge className={decisionColor[ev.decision] ?? ''} variant="secondary">{ev.decision?.replace('_', ' ')}</Badge>
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

function StatCard({ title, value, icon, subtitle, variant = 'default' }: { title: string; value: number; icon: React.ReactNode; subtitle?: string; variant?: 'default' | 'warning' }) {
  const borderColor = variant === 'warning' ? 'border-l-4 border-l-status-yellow' : '';
  return (
    <Card className={borderColor}>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="text-muted-foreground/50">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}