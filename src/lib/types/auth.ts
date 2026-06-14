export type AppRole = 'admin' | 'staff' | 'client';

export type ClientStatus = 'active' | 'inactive' | 'suspended';
export type DriverStatus = 'active' | 'inactive' | 'terminated';
export type VehicleStatus = 'active' | 'inactive' | 'sold' | 'removed';
export type DocumentStatus = 'current' | 'expired' | 'missing' | 'replaced';
export type DocumentVisibility = 'admin_only' | 'client_visible';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'in_progress' | 'resolved' | 'dismissed';
export type TaskStatus = 'pending' | 'in_progress' | 'waiting_on_client' | 'review' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type InvoiceStatus = 'paid' | 'unpaid' | 'partial' | 'overdue';
export type ComplianceStatus = 'green' | 'yellow' | 'red' | 'gray';
export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom';
export type AuditItemStatus = 'complete' | 'missing' | 'expired' | 'needs_review' | 'not_applicable';

export const DOCUMENT_CATEGORIES = [
  'Company Profile',
  'Driver Files',
  'Vehicle Files',
  'Insurance',
  'FMCSA/DOT',
  'Drug & Alcohol',
  'Clearinghouse',
  'HOS / ELD',
  'Pre-trip / Post-trip',
  'Violations',
  'Audit Ready',
  'Invoices',
  'Archive',
] as const;

export type DocumentCategory = typeof DOCUMENT_CATEGORIES[number];

export const COMPLIANCE_CATEGORIES = [
  'Driver Files',
  'Vehicle Maintenance Files',
  'Insurance',
  'FMCSA/DOT Documents',
  'Drug & Alcohol Clearinghouse',
  'Hours of Service / ELD',
  'Pre-trip / Post-trip Reports',
  'UCR Filings',
  'Registration / IRP Renewals',
  'Violations',
  'FMCSA Mock Audit',
  'Invoices / Payments',
] as const;

export interface AuthUser {
  id: string;
  email: string;
  role: AppRole;
  fullName: string;
  clientId: string | null; // null for admin/staff, set for client users
  assignedClientIds: string[]; // for staff: which clients they can access
}

export interface Module {
  key: string;
  label: string;
  href: string;
  icon: string;
  roles: AppRole[];
}