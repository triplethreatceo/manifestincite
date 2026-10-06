'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, TrendingUp, DollarSign, Truck, MapPin, BarChart3, Package } from 'lucide-react';

import type { AppRole } from '@/lib/types/auth';

interface Props {
  loads: any[];
  userRole: AppRole;
}

export function DispatchAnalytics({ loads, userRole }: Props) {
  const isAdmin = userRole === 'admin';
  const delivered = loads.filter((l) => ['delivered', 'completed'].includes(l.status));
  const totalRevenue = delivered.reduce((sum, l) => sum + (Number(l.rate) || 0), 0);
  const totalMiles = delivered.reduce((sum, l) => sum + (l.miles || 0), 0);
  const totalDH = delivered.reduce((sum, l) => sum + (l.deadhead_miles || 0), 0);
  const totalDispatchFees = delivered.reduce((sum, l) => sum + (Number(l.dispatch_fee_amount) || 0), 0);
  const totalDriverPay = delivered.reduce((sum, l) => sum + (Number(l.driver_pay) || 0), 0);
  const totalFuel = delivered.reduce((sum, l) => sum + (Number(l.fuel_cost) || 0), 0);
  const avgRPM = totalMiles > 0 ? totalRevenue / totalMiles : 0;
  const avgRate = delivered.length > 0 ? totalRevenue / delivered.length : 0;
  const dhPercent = totalMiles > 0 ? (totalDH / (totalMiles + totalDH)) * 100 : 0;

  // Broker breakdown
  const brokerMap = new Map<string, { count: number; revenue: number; miles: number }>();
  for (const l of delivered) {
    const name = l.broker_name || 'Unknown';
    const cur = brokerMap.get(name) || { count: 0, revenue: 0, miles: 0 };
    cur.count++;
    cur.revenue += Number(l.rate) || 0;
    cur.miles += l.miles || 0;
    brokerMap.set(name, cur);
  }
  const brokerStats = [...brokerMap.entries()]
    .map(([name, data]) => ({ name, ...data, rpm: data.miles > 0 ? data.revenue / data.miles : 0 }))
    .sort((a, b) => b.revenue - a.revenue);

  // Lane analysis (origin state → destination state)
  const laneMap = new Map<string, { count: number; revenue: number; avgRate: number }>();
  for (const l of delivered) {
    const lane = `${l.origin_state} → ${l.destination_state}`;
    const cur = laneMap.get(lane) || { count: 0, revenue: 0, avgRate: 0 };
    cur.count++;
    cur.revenue += Number(l.rate) || 0;
    laneMap.set(lane, cur);
  }
  const laneStats = [...laneMap.entries()]
    .map(([lane, data]) => ({ lane, ...data, avgRate: data.revenue / data.count }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Equipment breakdown
  const equipMap = new Map<string, { count: number; revenue: number }>();
  for (const l of delivered) {
    const type = l.equipment_type || 'Unspecified';
    const cur = equipMap.get(type) || { count: 0, revenue: 0 };
    cur.count++;
    cur.revenue += Number(l.rate) || 0;
    equipMap.set(type, cur);
  }
  const equipStats = [...equipMap.entries()]
    .map(([type, data]) => ({ type, ...data, avgRate: data.revenue / data.count }))
    .sort((a, b) => b.revenue - a.revenue);

  // Freight type breakdown
  const freightMap = new Map<string, { count: number; revenue: number }>();
  for (const l of delivered) {
    const type = l.freight_type || l.commodity || 'Unspecified';
    const cur = freightMap.get(type) || { count: 0, revenue: 0 };
    cur.count++;
    cur.revenue += Number(l.rate) || 0;
    freightMap.set(type, cur);
  }
  const freightStats = [...freightMap.entries()]
    .map(([type, data]) => ({ type, ...data, avgRate: data.revenue / data.count }))
    .sort((a, b) => b.revenue - a.revenue);

  // Top loads by rate
  const topLoads = [...delivered].sort((a, b) => (Number(b.rate) || 0) - (Number(a.rate) || 0)).slice(0, 10);

  // Client breakdown
  const clientMap = new Map<string, { count: number; revenue: number; fees: number }>();
  for (const l of delivered) {
    const name = l.clients?.company_legal_name || 'Unknown';
    const cur = clientMap.get(name) || { count: 0, revenue: 0, fees: 0 };
    cur.count++;
    cur.revenue += Number(l.rate) || 0;
    cur.fees += Number(l.dispatch_fee_amount) || 0;
    clientMap.set(name, cur);
  }
  const clientStats = [...clientMap.entries()]
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dispatch"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">Load Analytics</h1>
          <p className="text-sm text-muted-foreground">Performance insights across {delivered.length} delivered loads</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {isAdmin && <KPI label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={<DollarSign className="h-4 w-4" />} />}
        <KPI label="Loads Delivered" value={delivered.length.toString()} icon={<Package className="h-4 w-4" />} />
        {isAdmin && <KPI label="Avg Rate" value={`$${avgRate.toFixed(0)}`} icon={<TrendingUp className="h-4 w-4" />} />}
        {isAdmin && <KPI label="Avg RPM" value={`$${avgRPM.toFixed(2)}`} icon={<BarChart3 className="h-4 w-4" />} />}
        <KPI label="Total Miles" value={totalMiles.toLocaleString()} icon={<MapPin className="h-4 w-4" />} />
        <KPI label="DH %" value={`${dhPercent.toFixed(1)}%`} icon={<Truck className="h-4 w-4" />} highlight={dhPercent > 15} />
      </div>

      {/* Revenue Breakdown — admin only */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5 space-y-1">
              <p className="text-sm text-muted-foreground">Dispatch Fees Earned</p>
              <p className="text-2xl font-bold text-status-green">${totalDispatchFees.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 space-y-1">
              <p className="text-sm text-muted-foreground">Total Driver Pay</p>
              <p className="text-2xl font-bold">${totalDriverPay.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 space-y-1">
              <p className="text-sm text-muted-foreground">Total Fuel Cost</p>
              <p className="text-2xl font-bold">${totalFuel.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Brokers */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Top Brokers</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Broker</TableHead>
                  <TableHead className="text-right">Loads</TableHead>
                  {isAdmin && <TableHead className="text-right">Revenue</TableHead>}
                  {isAdmin && <TableHead className="text-right">RPM</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {brokerStats.slice(0, 8).map((b) => (
                  <TableRow key={b.name}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="text-right">{b.count}</TableCell>
                    {isAdmin && <TableCell className="text-right">${b.revenue.toLocaleString()}</TableCell>}
                    {isAdmin && <TableCell className="text-right">${b.rpm.toFixed(2)}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Lanes */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Top Lanes</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lane</TableHead>
                  <TableHead className="text-right">Loads</TableHead>
                  {isAdmin && <TableHead className="text-right">Revenue</TableHead>}
                  {isAdmin && <TableHead className="text-right">Avg Rate</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {laneStats.map((l) => (
                  <TableRow key={l.lane}>
                    <TableCell className="font-medium font-mono text-xs">{l.lane}</TableCell>
                    <TableCell className="text-right">{l.count}</TableCell>
                    {isAdmin && <TableCell className="text-right">${l.revenue.toLocaleString()}</TableCell>}
                    {isAdmin && <TableCell className="text-right">${l.avgRate.toFixed(0)}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* By Client — admin only */}
        {isAdmin && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Revenue by Client</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Loads</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Fees Earned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientStats.map((c) => (
                    <TableRow key={c.name}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-right">{c.count}</TableCell>
                      <TableCell className="text-right">${c.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-status-green">${c.fees.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Equipment & Freight */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">By Equipment & Freight Type</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">EQUIPMENT</p>
              {equipStats.map((e) => (
                <div key={e.type} className="flex justify-between text-sm py-1 border-b last:border-0">
                  <span>{e.type}</span>
                  <span className="text-muted-foreground">{e.count} loads{isAdmin ? ` · $${e.revenue.toLocaleString()} · avg $${e.avgRate.toFixed(0)}` : ''}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">FREIGHT TYPE</p>
              {freightStats.map((f) => (
                <div key={f.type} className="flex justify-between text-sm py-1 border-b last:border-0">
                  <span>{f.type}</span>
                  <span className="text-muted-foreground">{f.count} loads{isAdmin ? ` · $${f.revenue.toLocaleString()} · avg $${f.avgRate.toFixed(0)}` : ''}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Profitable Loads — admin only */}
      {isAdmin && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Most Profitable Loads</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Load #</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Broker</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Miles</TableHead>
                  <TableHead className="text-right">RPM</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topLoads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <Link href={`/dispatch/loads/${l.id}`} className="font-mono text-sm font-medium hover:underline">{l.load_number}</Link>
                    </TableCell>
                    <TableCell className="text-xs">{l.origin_city}, {l.origin_state} → {l.destination_city}, {l.destination_state}</TableCell>
                    <TableCell className="text-sm">{l.drivers?.full_name ?? '—'}</TableCell>
                    <TableCell className="text-sm">{l.broker_name ?? '—'}</TableCell>
                    <TableCell className="text-right font-medium">${Number(l.rate).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{l.miles?.toLocaleString() ?? '—'}</TableCell>
                    <TableCell className="text-right">{l.rate_per_mile ? `$${Number(l.rate_per_mile).toFixed(2)}` : '—'}</TableCell>
                    <TableCell className="text-right text-status-green">{l.dispatch_fee_amount ? `$${Number(l.dispatch_fee_amount).toFixed(0)}` : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KPI({ label, value, icon, highlight }: { label: string; value: string; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <Card className={highlight ? 'border-l-4 border-l-status-yellow' : ''}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] text-muted-foreground">{label}</p>
          <span className="text-muted-foreground/50">{icon}</span>
        </div>
        <p className="text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}