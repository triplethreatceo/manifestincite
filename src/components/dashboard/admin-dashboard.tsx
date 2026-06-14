'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  AlertTriangle,
  ShieldAlert,
  Receipt,
  FileText,
  CheckSquare,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface AdminDashboardProps {
  stats: {
    totalActiveClients: number;
    totalInactiveClients: number;
    openAlerts: number;
    criticalAlerts: number;
  };
  recentAlerts: any[];
  unpaidInvoices: any[];
  recentDocuments: any[];
  openTasks: any[];
  upcomingDeadlines: any[];
}

const severityColor: Record<string, string> = {
  critical: 'bg-status-red text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-status-yellow text-black',
  low: 'bg-blue-100 text-blue-800',
};

const statusColor: Record<string, string> = {
  paid: 'bg-status-green/10 text-status-green',
  unpaid: 'bg-status-yellow/10 text-status-yellow',
  overdue: 'bg-status-red/10 text-status-red',
  partial: 'bg-orange-100 text-orange-700',
};

export function AdminDashboard({
  stats,
  recentAlerts,
  unpaidInvoices,
  recentDocuments,
  openTasks,
  upcomingDeadlines,
}: AdminDashboardProps) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  async function runAlertEngine() {
    setGenerating(true);
    try {
      const res = await fetch('/api/alerts/generate', { method: 'POST' });
      const result = await res.json();
      toast.success(`Scanned: ${result.total} checks. Created ${result.created} new alerts, updated ${result.updated}.`);
      router.refresh();
    } catch {
      toast.error('Failed to generate alerts');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Compliance overview across all clients</p>
        </div>
        <Button onClick={runAlertEngine} disabled={generating} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Scanning...' : 'Run Compliance Scan'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Clients"
          value={stats.totalActiveClients}
          icon={<Building2 className="h-5 w-5" />}
          subtitle={`${stats.totalInactiveClients} inactive`}
        />
        <StatCard
          title="Open Alerts"
          value={stats.openAlerts}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant={stats.openAlerts > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Critical Alerts"
          value={stats.criticalAlerts}
          icon={<ShieldAlert className="h-5 w-5" />}
          variant={stats.criticalAlerts > 0 ? 'danger' : 'default'}
        />
        <StatCard
          title="Unpaid Invoices"
          value={unpaidInvoices.length}
          icon={<Receipt className="h-5 w-5" />}
          variant={unpaidInvoices.length > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No open alerts</p>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.clients?.company_legal_name}</p>
                    </div>
                    <Badge className={severityColor[alert.severity] ?? ''} variant="secondary">
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.clients?.company_legal_name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.due_date ? format(new Date(item.due_date), 'MMM d') : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unpaid Invoices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              Unpaid Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unpaidInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">All invoices paid</p>
            ) : (
              <div className="space-y-3">
                {unpaidInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-start justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium">{inv.invoice_number}</p>
                      <p className="text-xs text-muted-foreground">{inv.clients?.company_legal_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${Number(inv.balance).toFixed(2)}</p>
                      <Badge className={statusColor[inv.status] ?? ''} variant="secondary">
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              Open Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {openTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No open tasks</p>
            ) : (
              <div className="space-y-3">
                {openTasks.map((task) => (
                  <div key={task.id} className="flex items-start justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.clients?.company_legal_name}
                        {task.users?.full_name && ` · ${task.users.full_name}`}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {task.due_date ? format(new Date(task.due_date), 'MMM d') : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Uploads */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Recent Uploads
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent uploads</p>
            ) : (
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{doc.document_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.clients?.company_legal_name} · {doc.category}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{doc.users?.full_name ?? 'Unknown'}</p>
                      <p>{format(new Date(doc.created_at), 'MMM d, h:mm a')}</p>
                    </div>
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

function StatCard({
  title,
  value,
  icon,
  subtitle,
  variant = 'default',
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  subtitle?: string;
  variant?: 'default' | 'warning' | 'danger';
}) {
  const borderColor = {
    default: '',
    warning: 'border-l-4 border-l-status-yellow',
    danger: 'border-l-4 border-l-status-red',
  }[variant];

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