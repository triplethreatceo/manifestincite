'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Truck, MapPin, Package, MessageSquare, Plus, Users } from 'lucide-react';
import { format } from 'date-fns';

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

function formatStatus(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Props {
  activeLoads: any[];
  stats: {
    totalActive: number;
    deliveredToday: number;
    pickupsToday: number;
    unreadMessages: number;
  };
  availableDrivers: any[];
}

export function DispatchDashboard({ activeLoads, stats, availableDrivers }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dispatch</h1>
          <p className="text-sm text-muted-foreground">Load tracking & driver dispatch operations</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dispatch/messages">
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />Messages
              {stats.unreadMessages > 0 && (
                <Badge className="ml-2 bg-[#C41E3A] text-white text-[10px] px-1.5">{stats.unreadMessages}</Badge>
              )}
            </Button>
          </Link>
          <Link href="/dispatch/loads/new">
            <Button className="bg-[#C41E3A] hover:bg-[#A51830] text-white" size="sm">
              <Plus className="h-4 w-4 mr-2" />New Load
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Loads" value={stats.totalActive} icon={<Package className="h-5 w-5" />} />
        <StatCard title="Pickups Today" value={stats.pickupsToday} icon={<MapPin className="h-5 w-5" />} variant={stats.pickupsToday > 0 ? 'warning' : 'default'} />
        <StatCard title="Delivered Today" value={stats.deliveredToday} icon={<Truck className="h-5 w-5" />} />
        <StatCard title="Unread Messages" value={stats.unreadMessages} icon={<MessageSquare className="h-5 w-5" />} variant={stats.unreadMessages > 0 ? 'warning' : 'default'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Loads */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />Active Loads
              </CardTitle>
              <Link href="/dispatch/loads">
                <Button variant="ghost" size="sm" className="text-xs">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Load #</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeLoads.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No active loads</TableCell></TableRow>
                ) : (
                  activeLoads.map((load) => (
                    <TableRow key={load.id}>
                      <TableCell>
                        <Link href={`/dispatch/loads/${load.id}`} className="font-medium font-mono text-sm hover:underline">{load.load_number}</Link>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>{load.origin_city}, {load.origin_state}</div>
                        <div className="text-muted-foreground">→ {load.destination_city}, {load.destination_state}</div>
                      </TableCell>
                      <TableCell className="text-sm">{load.drivers?.full_name ?? <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                      <TableCell className="text-xs">{format(new Date(load.pickup_date), 'MM/dd')}</TableCell>
                      <TableCell>
                        <Badge className={statusColor[load.status] ?? ''} variant="secondary">{formatStatus(load.status)}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Available Drivers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />Available Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableDrivers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No available drivers</p>
            ) : (
              <div className="space-y-3">
                {availableDrivers.map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{d.full_name}</p>
                      <p className="text-xs text-muted-foreground">{d.clients?.company_legal_name}</p>
                    </div>
                    <Badge className="bg-status-green/10 text-status-green" variant="secondary">Available</Badge>
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

function StatCard({ title, value, icon, variant = 'default' }: { title: string; value: number; icon: React.ReactNode; variant?: 'default' | 'warning' }) {
  const borderColor = variant === 'warning' ? 'border-l-4 border-l-status-yellow' : '';
  return (
    <Card className={borderColor}>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className="text-muted-foreground/50">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}