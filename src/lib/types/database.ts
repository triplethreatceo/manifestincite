import type {
  AppRole,
  ClientStatus,
  DriverStatus,
  VehicleStatus,
  DocumentStatus,
  DocumentVisibility,
  DocumentCategory,
  AlertSeverity,
  AlertStatus,
  TaskStatus,
  TaskPriority,
  InvoiceStatus,
  ComplianceStatus,
  RecurringFrequency,
  AuditItemStatus,
} from './auth';

// ── Users ──────────────────────────────────────────────
export interface DbUser {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Clients (trucking companies) ───────────────────────
export interface DbClient {
  id: string;
  company_legal_name: string;
  dba_name: string | null;
  dot_number: string | null;
  mc_number: string | null;
  ein: string | null;
  business_address: string | null;
  mailing_address: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  start_date: string | null;
  status: ClientStatus;
  monthly_service_fee: number | null;
  white_label_partner: string | null;
  internal_notes: string | null;
  compliance_status: ComplianceStatus;
  created_at: string;
  updated_at: string;
}

// ── Client Users (portal login) ────────────────────────
export interface DbClientUser {
  id: string;
  user_id: string;
  client_id: string;
  created_at: string;
}

// ── Staff Assignments ──────────────────────────────────
export interface DbStaffAssignment {
  id: string;
  user_id: string;
  client_id: string;
  created_at: string;
}

// ── Drivers ────────────────────────────────────────────
export interface DbDriver {
  id: string;
  client_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  cdl_number: string | null;
  cdl_state: string | null;
  cdl_expiration_date: string | null;
  medical_card_expiration_date: string | null;
  mvr_date: string | null;
  background_check_date: string | null;
  drug_test_date: string | null;
  clearinghouse_query_date: string | null;
  employment_application_status: string | null;
  driver_qualification_file_status: string | null;
  status: DriverStatus;
  assigned_vehicle_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ── Vehicles ───────────────────────────────────────────
export interface DbVehicle {
  id: string;
  client_id: string;
  unit_number: string | null;
  vin: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  plate_number: string | null;
  registration_state: string | null;
  registration_expiration_date: string | null;
  insurance_expiration_date: string | null;
  annual_inspection_due_date: string | null;
  maintenance_status: string | null;
  status: VehicleStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ── Documents ──────────────────────────────────────────
export interface DbDocument {
  id: string;
  client_id: string;
  category: DocumentCategory;
  driver_id: string | null;
  vehicle_id: string | null;
  document_name: string;
  document_type: string | null;
  upload_date: string;
  expiration_date: string | null;
  uploaded_by: string;
  visibility: DocumentVisibility;
  status: DocumentStatus;
  file_path: string;
  file_size: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ── Alerts ─────────────────────────────────────────────
export interface DbAlert {
  id: string;
  client_id: string;
  category: string;
  driver_id: string | null;
  vehicle_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  severity: AlertSeverity;
  status: AlertStatus;
  assigned_staff_id: string | null;
  resolved_date: string | null;
  created_at: string;
  updated_at: string;
}

// ── Tasks ──────────────────────────────────────────────
export interface DbTask {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  category: string | null;
  assigned_staff_id: string | null;
  priority: TaskPriority;
  due_date: string | null;
  status: TaskStatus;
  document_id: string | null;
  driver_id: string | null;
  vehicle_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ── Recurring Tasks (Phase 2) ──────────────────────────
export interface DbRecurringTask {
  id: string;
  task_name: string;
  client_id: string;
  category: string | null;
  start_date: string;
  next_due_date: string;
  frequency: RecurringFrequency;
  assigned_staff_id: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ── Calendar Events ────────────────────────────────────
export interface DbCalendarEvent {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_type: string;
  category: string | null;
  severity: AlertSeverity | null;
  related_driver_id: string | null;
  related_vehicle_id: string | null;
  related_alert_id: string | null;
  created_at: string;
}

// ── Invoices ───────────────────────────────────────────
export interface DbInvoice {
  id: string;
  client_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  amount_paid: number;
  balance: number;
  status: InvoiceStatus;
  payment_date: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ── Payments ───────────────────────────────────────────
export interface DbPayment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

// ── Audit Checklist Items ──────────────────────────────
export interface DbAuditChecklistItem {
  id: string;
  client_id: string;
  item_name: string;
  status: AuditItemStatus;
  document_id: string | null;
  created_at: string;
  updated_at: string;
}

// ── Notification Logs ──────────────────────────────────
export interface DbNotificationLog {
  id: string;
  user_id: string | null;
  client_id: string | null;
  channel: 'in_app' | 'email' | 'sms';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}