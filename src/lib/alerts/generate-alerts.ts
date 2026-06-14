import { SupabaseClient } from '@supabase/supabase-js';
import { differenceInDays, format } from 'date-fns';
import type { AlertSeverity } from '@/lib/types/auth';

interface ExpirationCheck {
  clientId: string;
  category: string;
  title: string;
  description: string;
  dueDate: string;
  driverId?: string;
  vehicleId?: string;
}

function getSeverity(daysUntilDue: number): AlertSeverity {
  if (daysUntilDue <= 0) return 'critical';
  if (daysUntilDue <= 7) return 'high';
  if (daysUntilDue <= 30) return 'medium';
  return 'low';
}

function formatDate(d: string): string {
  return format(new Date(d), 'MM/dd/yyyy');
}

export async function generateAlerts(admin: SupabaseClient, clientId?: string) {
  const checks: ExpirationCheck[] = [];
  const today = new Date();

  // ── Driver expiration checks ──────────────────────────
  let driverQuery = admin
    .from('drivers')
    .select('id, client_id, full_name, cdl_expiration_date, medical_card_expiration_date, mvr_date, background_check_date, drug_test_date, clearinghouse_query_date')
    .eq('status', 'active');

  if (clientId) driverQuery = driverQuery.eq('client_id', clientId);

  const { data: drivers } = await driverQuery;

  for (const driver of drivers ?? []) {
    const driverChecks: { field: string; label: string; date: string | null }[] = [
      { field: 'cdl_expiration_date', label: 'CDL', date: driver.cdl_expiration_date },
      { field: 'medical_card_expiration_date', label: 'Medical Card', date: driver.medical_card_expiration_date },
    ];

    for (const check of driverChecks) {
      if (!check.date) {
        // Missing critical date
        checks.push({
          clientId: driver.client_id,
          category: 'Driver Files',
          title: `${check.label} date missing — ${driver.full_name}`,
          description: `No ${check.label.toLowerCase()} expiration date on file for driver ${driver.full_name}.`,
          dueDate: today.toISOString().split('T')[0],
          driverId: driver.id,
        });
        continue;
      }

      const daysUntil = differenceInDays(new Date(check.date), today);
      if (daysUntil <= 30) {
        const expired = daysUntil <= 0;
        checks.push({
          clientId: driver.client_id,
          category: 'Driver Files',
          title: `${check.label} ${expired ? 'EXPIRED' : 'expiring soon'} — ${driver.full_name}`,
          description: `${check.label} for ${driver.full_name} ${expired ? 'expired on' : 'expires'} ${formatDate(check.date)}.`,
          dueDate: check.date,
          driverId: driver.id,
        });
      }
    }

    // MVR check — flag if older than 12 months
    if (driver.mvr_date) {
      const daysSinceMvr = differenceInDays(today, new Date(driver.mvr_date));
      if (daysSinceMvr > 335) {
        checks.push({
          clientId: driver.client_id,
          category: 'Driver Files',
          title: `MVR check ${daysSinceMvr > 365 ? 'overdue' : 'due soon'} — ${driver.full_name}`,
          description: `Last MVR for ${driver.full_name} was ${formatDate(driver.mvr_date)}.`,
          dueDate: driver.mvr_date,
          driverId: driver.id,
        });
      }
    } else {
      checks.push({
        clientId: driver.client_id,
        category: 'Driver Files',
        title: `MVR not on file — ${driver.full_name}`,
        description: `No MVR date recorded for driver ${driver.full_name}.`,
        dueDate: today.toISOString().split('T')[0],
        driverId: driver.id,
      });
    }

    // Drug test check — flag if older than 12 months
    if (driver.drug_test_date) {
      const daysSince = differenceInDays(today, new Date(driver.drug_test_date));
      if (daysSince > 335) {
        checks.push({
          clientId: driver.client_id,
          category: 'Drug & Alcohol',
          title: `Drug test ${daysSince > 365 ? 'overdue' : 'due soon'} — ${driver.full_name}`,
          description: `Last drug test for ${driver.full_name} was ${formatDate(driver.drug_test_date)}.`,
          dueDate: driver.drug_test_date,
          driverId: driver.id,
        });
      }
    }

    // Clearinghouse query — flag if older than 12 months
    if (driver.clearinghouse_query_date) {
      const daysSince = differenceInDays(today, new Date(driver.clearinghouse_query_date));
      if (daysSince > 335) {
        checks.push({
          clientId: driver.client_id,
          category: 'Clearinghouse',
          title: `Clearinghouse query ${daysSince > 365 ? 'overdue' : 'due soon'} — ${driver.full_name}`,
          description: `Last Clearinghouse query for ${driver.full_name} was ${formatDate(driver.clearinghouse_query_date)}.`,
          dueDate: driver.clearinghouse_query_date,
          driverId: driver.id,
        });
      }
    }
  }

  // ── Vehicle expiration checks ─────────────────────────
  let vehicleQuery = admin
    .from('vehicles')
    .select('id, client_id, unit_number, registration_expiration_date, insurance_expiration_date, annual_inspection_due_date')
    .eq('status', 'active');

  if (clientId) vehicleQuery = vehicleQuery.eq('client_id', clientId);

  const { data: vehicles } = await vehicleQuery;

  for (const vehicle of vehicles ?? []) {
    const label = vehicle.unit_number ?? vehicle.id.slice(0, 8);

    const vehicleChecks: { field: string; label: string; date: string | null }[] = [
      { field: 'registration_expiration_date', label: 'Registration', date: vehicle.registration_expiration_date },
      { field: 'insurance_expiration_date', label: 'Insurance', date: vehicle.insurance_expiration_date },
      { field: 'annual_inspection_due_date', label: 'Annual DOT Inspection', date: vehicle.annual_inspection_due_date },
    ];

    for (const check of vehicleChecks) {
      if (!check.date) continue; // Don't alert on missing vehicle dates — less critical

      const daysUntil = differenceInDays(new Date(check.date), today);
      if (daysUntil <= 30) {
        const expired = daysUntil <= 0;
        checks.push({
          clientId: vehicle.client_id,
          category: 'Vehicle Maintenance Files',
          title: `${check.label} ${expired ? 'EXPIRED' : 'expiring soon'} — Unit ${label}`,
          description: `${check.label} for Unit ${label} ${expired ? 'expired on' : 'expires'} ${formatDate(check.date)}.`,
          dueDate: check.date,
          vehicleId: vehicle.id,
        });
      }
    }
  }

  // ── Invoice overdue checks ────────────────────────────
  let invoiceQuery = admin
    .from('invoices')
    .select('id, client_id, invoice_number, due_date, balance')
    .in('status', ['unpaid', 'partial']);

  if (clientId) invoiceQuery = invoiceQuery.eq('client_id', clientId);

  const { data: invoices } = await invoiceQuery;

  for (const inv of invoices ?? []) {
    const daysUntil = differenceInDays(new Date(inv.due_date), today);
    if (daysUntil <= 7) {
      checks.push({
        clientId: inv.client_id,
        category: 'Invoices / Payments',
        title: `Invoice ${inv.invoice_number} ${daysUntil <= 0 ? 'OVERDUE' : 'due soon'}`,
        description: `Balance: $${Number(inv.balance).toFixed(2)}. Due ${formatDate(inv.due_date)}.`,
        dueDate: inv.due_date,
      });
    }
  }

  // ── Upsert alerts (avoid duplicates) ──────────────────
  let created = 0;
  let skipped = 0;

  for (const check of checks) {
    const severity = getSeverity(differenceInDays(new Date(check.dueDate), today));

    // Check for existing open alert with same title + client
    const { data: existing } = await admin
      .from('alerts')
      .select('id')
      .eq('client_id', check.clientId)
      .eq('title', check.title)
      .in('status', ['open', 'in_progress'])
      .limit(1);

    if (existing && existing.length > 0) {
      // Update severity if it changed
      await admin
        .from('alerts')
        .update({ severity, description: check.description, due_date: check.dueDate })
        .eq('id', existing[0].id);
      skipped++;
      continue;
    }

    await admin.from('alerts').insert({
      client_id: check.clientId,
      category: check.category,
      title: check.title,
      description: check.description,
      due_date: check.dueDate,
      severity,
      status: 'open',
      driver_id: check.driverId ?? null,
      vehicle_id: check.vehicleId ?? null,
    });
    created++;
  }

  return { total: checks.length, created, updated: skipped };
}

// Update a single client's compliance status based on their alerts
export async function updateComplianceStatus(admin: SupabaseClient, clientId: string) {
  const { data: client } = await admin
    .from('clients')
    .select('status')
    .eq('id', clientId)
    .single();

  if (client?.status === 'inactive') {
    await admin.from('clients').update({ compliance_status: 'gray' }).eq('id', clientId);
    return;
  }

  const { data: alerts } = await admin
    .from('alerts')
    .select('severity')
    .eq('client_id', clientId)
    .in('status', ['open', 'in_progress']);

  const severities = (alerts ?? []).map((a) => a.severity);

  let status: 'green' | 'yellow' | 'red' | 'gray' = 'green';
  if (severities.includes('critical') || severities.includes('high')) {
    status = 'red';
  } else if (severities.includes('medium')) {
    status = 'yellow';
  }

  await admin.from('clients').update({ compliance_status: status }).eq('id', clientId);
}