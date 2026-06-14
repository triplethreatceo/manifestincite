-- ManifestIncite — Phase 1 Schema
-- FMCSA/DOT Compliance Management Portal

-- ═══════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════

CREATE TYPE app_role AS ENUM ('admin', 'staff', 'client');
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE driver_status AS ENUM ('active', 'inactive', 'terminated');
CREATE TYPE vehicle_status AS ENUM ('active', 'inactive', 'sold', 'removed');
CREATE TYPE document_status AS ENUM ('current', 'expired', 'missing', 'replaced');
CREATE TYPE document_visibility AS ENUM ('admin_only', 'client_visible');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE alert_status AS ENUM ('open', 'in_progress', 'resolved', 'dismissed');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'waiting_on_client', 'review', 'completed', 'overdue');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE invoice_status AS ENUM ('paid', 'unpaid', 'partial', 'overdue');
CREATE TYPE compliance_status AS ENUM ('green', 'yellow', 'red', 'gray');
CREATE TYPE recurring_frequency AS ENUM ('weekly', 'monthly', 'quarterly', 'annually', 'custom');
CREATE TYPE audit_item_status AS ENUM ('complete', 'missing', 'expired', 'needs_review', 'not_applicable');
CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'sms');

-- ═══════════════════════════════════════════════════════
-- USERS
-- ═══════════════════════════════════════════════════════

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'staff',
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════
-- CLIENTS (trucking companies)
-- ═══════════════════════════════════════════════════════

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_legal_name TEXT NOT NULL,
  dba_name TEXT,
  dot_number TEXT,
  mc_number TEXT,
  ein TEXT,
  business_address TEXT,
  mailing_address TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  start_date DATE,
  status client_status NOT NULL DEFAULT 'active',
  monthly_service_fee NUMERIC(10,2),
  white_label_partner TEXT,
  internal_notes TEXT,
  compliance_status compliance_status NOT NULL DEFAULT 'gray',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_dot ON clients(dot_number);

-- ═══════════════════════════════════════════════════════
-- CLIENT USERS (portal login join)
-- ═══════════════════════════════════════════════════════

CREATE TABLE client_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, client_id)
);

CREATE INDEX idx_client_users_user ON client_users(user_id);
CREATE INDEX idx_client_users_client ON client_users(client_id);

-- ═══════════════════════════════════════════════════════
-- STAFF ASSIGNMENTS
-- ═══════════════════════════════════════════════════════

CREATE TABLE staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, client_id)
);

CREATE INDEX idx_staff_assignments_user ON staff_assignments(user_id);
CREATE INDEX idx_staff_assignments_client ON staff_assignments(client_id);

-- ═══════════════════════════════════════════════════════
-- DRIVERS
-- ═══════════════════════════════════════════════════════

CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  cdl_number TEXT,
  cdl_state TEXT,
  cdl_expiration_date DATE,
  medical_card_expiration_date DATE,
  mvr_date DATE,
  background_check_date DATE,
  drug_test_date DATE,
  clearinghouse_query_date DATE,
  employment_application_status TEXT,
  driver_qualification_file_status TEXT,
  status driver_status NOT NULL DEFAULT 'active',
  assigned_vehicle_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_drivers_client ON drivers(client_id);
CREATE INDEX idx_drivers_status ON drivers(status);

-- ═══════════════════════════════════════════════════════
-- VEHICLES
-- ═══════════════════════════════════════════════════════

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  unit_number TEXT,
  vin TEXT,
  year INTEGER,
  make TEXT,
  model TEXT,
  plate_number TEXT,
  registration_state TEXT,
  registration_expiration_date DATE,
  insurance_expiration_date DATE,
  annual_inspection_due_date DATE,
  maintenance_status TEXT,
  status vehicle_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicles_client ON vehicles(client_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);

-- Add FK for drivers.assigned_vehicle_id now that vehicles exist
ALTER TABLE drivers ADD CONSTRAINT fk_driver_vehicle
  FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL;

-- ═══════════════════════════════════════════════════════
-- DOCUMENTS
-- ═══════════════════════════════════════════════════════

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  document_name TEXT NOT NULL,
  document_type TEXT,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiration_date DATE,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  visibility document_visibility NOT NULL DEFAULT 'admin_only',
  status document_status NOT NULL DEFAULT 'current',
  file_path TEXT NOT NULL,
  file_size BIGINT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_client ON documents(client_id);
CREATE INDEX idx_documents_driver ON documents(driver_id);
CREATE INDEX idx_documents_vehicle ON documents(vehicle_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_expiration ON documents(expiration_date);

-- ═══════════════════════════════════════════════════════
-- ALERTS
-- ═══════════════════════════════════════════════════════

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  severity alert_severity NOT NULL DEFAULT 'low',
  status alert_status NOT NULL DEFAULT 'open',
  assigned_staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_alerts_client ON alerts(client_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_due_date ON alerts(due_date);

-- ═══════════════════════════════════════════════════════
-- TASKS
-- ═══════════════════════════════════════════════════════

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  assigned_staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date DATE,
  status task_status NOT NULL DEFAULT 'pending',
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_client ON tasks(client_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_staff_id);

-- ═══════════════════════════════════════════════════════
-- RECURRING TASKS (Phase 2 — table created now, logic later)
-- ═══════════════════════════════════════════════════════

CREATE TABLE recurring_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  category TEXT,
  start_date DATE NOT NULL,
  next_due_date DATE NOT NULL,
  frequency recurring_frequency NOT NULL DEFAULT 'monthly',
  assigned_staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════
-- CALENDAR EVENTS
-- ═══════════════════════════════════════════════════════

CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL,
  category TEXT,
  severity alert_severity,
  related_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  related_vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  related_alert_id UUID REFERENCES alerts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_calendar_events_client ON calendar_events(client_id);
CREATE INDEX idx_calendar_events_date ON calendar_events(event_date);

-- ═══════════════════════════════════════════════════════
-- INVOICES
-- ═══════════════════════════════════════════════════════

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  balance NUMERIC(10,2) GENERATED ALWAYS AS (amount - amount_paid) STORED,
  status invoice_status NOT NULL DEFAULT 'unpaid',
  payment_date DATE,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ═══════════════════════════════════════════════════════
-- PAYMENTS
-- ═══════════════════════════════════════════════════════

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);

-- ═══════════════════════════════════════════════════════
-- AUDIT CHECKLIST ITEMS (Phase 2 logic, table now)
-- ═══════════════════════════════════════════════════════

CREATE TABLE audit_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  status audit_item_status NOT NULL DEFAULT 'missing',
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_items_client ON audit_checklist_items(client_id);

-- ═══════════════════════════════════════════════════════
-- DRUG & ALCOHOL RECORDS
-- ═══════════════════════════════════════════════════════

CREATE TABLE drug_alcohol_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  test_date DATE NOT NULL,
  test_type TEXT NOT NULL,
  result TEXT,
  status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_drug_alcohol_driver ON drug_alcohol_records(driver_id);

-- ═══════════════════════════════════════════════════════
-- CLEARINGHOUSE RECORDS
-- ═══════════════════════════════════════════════════════

CREATE TABLE clearinghouse_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  query_date DATE NOT NULL,
  query_type TEXT NOT NULL,
  result TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clearinghouse_driver ON clearinghouse_records(driver_id);

-- ═══════════════════════════════════════════════════════
-- HOS RECORDS
-- ═══════════════════════════════════════════════════════

CREATE TABLE hos_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  hours_driven NUMERIC(4,1),
  status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hos_driver ON hos_records(driver_id);

-- ═══════════════════════════════════════════════════════
-- VEHICLE MAINTENANCE RECORDS
-- ═══════════════════════════════════════════════════════

CREATE TABLE vehicle_maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  service_type TEXT NOT NULL,
  description TEXT,
  cost NUMERIC(10,2),
  vendor TEXT,
  next_service_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_maintenance_vehicle ON vehicle_maintenance_records(vehicle_id);

-- ═══════════════════════════════════════════════════════
-- NOTIFICATION LOGS
-- ═══════════════════════════════════════════════════════

CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  channel notification_channel NOT NULL DEFAULT 'in_app',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notification_logs(user_id);

-- ═══════════════════════════════════════════════════════
-- UPDATED_AT TRIGGER
-- ═══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_audit_items_updated_at BEFORE UPDATE ON audit_checklist_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_recurring_tasks_updated_at BEFORE UPDATE ON recurring_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_alcohol_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE clearinghouse_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE hos_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;

-- ── Users: can read own profile ──
CREATE POLICY users_select_own ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id);

-- ── Admins: full access to all tables ──
-- We check role from the users table via a helper function

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS app_role AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Admins can see all users
CREATE POLICY users_admin_all ON users FOR ALL
  USING (get_user_role() = 'admin');

-- ── Clients: admin sees all, staff sees assigned, client sees own ──
CREATE POLICY clients_admin ON clients FOR ALL
  USING (get_user_role() = 'admin');

CREATE POLICY clients_staff ON clients FOR SELECT
  USING (
    get_user_role() = 'staff'
    AND id IN (SELECT client_id FROM staff_assignments WHERE user_id = auth.uid())
  );

CREATE POLICY clients_client ON clients FOR SELECT
  USING (
    get_user_role() = 'client'
    AND id IN (SELECT client_id FROM client_users WHERE user_id = auth.uid())
  );

-- ── Tenant-scoped tables: macro policy pattern ──
-- Drivers
CREATE POLICY drivers_admin ON drivers FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY drivers_staff ON drivers FOR ALL
  USING (get_user_role() = 'staff' AND client_id IN (SELECT client_id FROM staff_assignments WHERE user_id = auth.uid()));
CREATE POLICY drivers_client ON drivers FOR SELECT
  USING (get_user_role() = 'client' AND client_id IN (SELECT client_id FROM client_users WHERE user_id = auth.uid()));

-- Vehicles
CREATE POLICY vehicles_admin ON vehicles FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY vehicles_staff ON vehicles FOR ALL
  USING (get_user_role() = 'staff' AND client_id IN (SELECT client_id FROM staff_assignments WHERE user_id = auth.uid()));
CREATE POLICY vehicles_client ON vehicles FOR SELECT
  USING (get_user_role() = 'client' AND client_id IN (SELECT client_id FROM client_users WHERE user_id = auth.uid()));

-- Documents (with visibility control for clients)
CREATE POLICY documents_admin ON documents FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY documents_staff ON documents FOR ALL
  USING (get_user_role() = 'staff' AND client_id IN (SELECT client_id FROM staff_assignments WHERE user_id = auth.uid()));
CREATE POLICY documents_client ON documents FOR SELECT
  USING (
    get_user_role() = 'client'
    AND client_id IN (SELECT client_id FROM client_users WHERE user_id = auth.uid())
    AND visibility = 'client_visible'
  );

-- Alerts
CREATE POLICY alerts_admin ON alerts FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY alerts_staff ON alerts FOR ALL
  USING (get_user_role() = 'staff' AND client_id IN (SELECT client_id FROM staff_assignments WHERE user_id = auth.uid()));
CREATE POLICY alerts_client ON alerts FOR SELECT
  USING (get_user_role() = 'client' AND client_id IN (SELECT client_id FROM client_users WHERE user_id = auth.uid()));

-- Tasks (admin + staff only)
CREATE POLICY tasks_admin ON tasks FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY tasks_staff ON tasks FOR ALL
  USING (get_user_role() = 'staff' AND client_id IN (SELECT client_id FROM staff_assignments WHERE user_id = auth.uid()));

-- Calendar Events
CREATE POLICY calendar_admin ON calendar_events FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY calendar_staff ON calendar_events FOR SELECT
  USING (get_user_role() = 'staff' AND client_id IN (SELECT client_id FROM staff_assignments WHERE user_id = auth.uid()));
CREATE POLICY calendar_client ON calendar_events FOR SELECT
  USING (get_user_role() = 'client' AND client_id IN (SELECT client_id FROM client_users WHERE user_id = auth.uid()));

-- Invoices
CREATE POLICY invoices_admin ON invoices FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY invoices_staff ON invoices FOR SELECT
  USING (get_user_role() = 'staff' AND client_id IN (SELECT client_id FROM staff_assignments WHERE user_id = auth.uid()));
CREATE POLICY invoices_client ON invoices FOR SELECT
  USING (get_user_role() = 'client' AND client_id IN (SELECT client_id FROM client_users WHERE user_id = auth.uid()));

-- Payments
CREATE POLICY payments_admin ON payments FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY payments_staff ON payments FOR SELECT
  USING (get_user_role() = 'staff' AND invoice_id IN (
    SELECT id FROM invoices WHERE client_id IN (SELECT client_id FROM staff_assignments WHERE user_id = auth.uid())
  ));
CREATE POLICY payments_client ON payments FOR SELECT
  USING (get_user_role() = 'client' AND invoice_id IN (
    SELECT id FROM invoices WHERE client_id IN (SELECT client_id FROM client_users WHERE user_id = auth.uid())
  ));

-- Audit checklist items
CREATE POLICY audit_items_admin ON audit_checklist_items FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY audit_items_staff ON audit_checklist_items FOR SELECT
  USING (get_user_role() = 'staff' AND client_id IN (SELECT client_id FROM staff_assignments WHERE user_id = auth.uid()));
CREATE POLICY audit_items_client ON audit_checklist_items FOR SELECT
  USING (get_user_role() = 'client' AND client_id IN (SELECT client_id FROM client_users WHERE user_id = auth.uid()));

-- Drug/alcohol, clearinghouse, HOS, maintenance records follow same pattern
CREATE POLICY drug_alcohol_admin ON drug_alcohol_records FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY drug_alcohol_staff ON drug_alcohol_records FOR ALL
  USING (get_user_role() = 'staff' AND client_id IN (SELECT client_id FROM staff_assignments WHERE user_id = auth.uid()));
CREATE POLICY drug_alcohol_client ON drug_alcohol_records FOR SELECT
  USING (get_user_role() = 'client' AND client_id IN (SELECT client_id FROM client_users WHERE user_id = auth.uid()));

CREATE POLICY clearinghouse_admin ON clearinghouse_records FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY clearinghouse_staff ON clearinghouse_records FOR ALL
  USING (get_user_role() = 'staff' AND client_id IN (SELECT client_id FROM staff_assignments WHERE user_id = auth.uid()));
CREATE POLICY clearinghouse_client ON clearinghouse_records FOR SELECT
  USING (get_user_role() = 'client' AND client_id IN (SELECT client_id FROM client_users WHERE user_id = auth.uid()));

CREATE POLICY hos_admin ON hos_records FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY hos_staff ON hos_records FOR ALL
  USING (get_user_role() = 'staff' AND client_id IN (SELECT client_id FROM staff_assignments WHERE user_id = auth.uid()));
CREATE POLICY hos_client ON hos_records FOR SELECT
  USING (get_user_role() = 'client' AND client_id IN (SELECT client_id FROM client_users WHERE user_id = auth.uid()));

CREATE POLICY maintenance_admin ON vehicle_maintenance_records FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY maintenance_staff ON vehicle_maintenance_records FOR ALL
  USING (get_user_role() = 'staff' AND client_id IN (SELECT client_id FROM staff_assignments WHERE user_id = auth.uid()));
CREATE POLICY maintenance_client ON vehicle_maintenance_records FOR SELECT
  USING (get_user_role() = 'client' AND client_id IN (SELECT client_id FROM client_users WHERE user_id = auth.uid()));

-- Notification logs: user sees own
CREATE POLICY notifications_own ON notification_logs FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY notifications_admin ON notification_logs FOR ALL
  USING (get_user_role() = 'admin');

-- Client users / staff assignments: admin manages
CREATE POLICY client_users_admin ON client_users FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY client_users_own ON client_users FOR SELECT USING (user_id = auth.uid());

CREATE POLICY staff_assignments_admin ON staff_assignments FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY staff_assignments_own ON staff_assignments FOR SELECT USING (user_id = auth.uid());

-- Recurring tasks
CREATE POLICY recurring_tasks_admin ON recurring_tasks FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY recurring_tasks_staff ON recurring_tasks FOR ALL
  USING (get_user_role() = 'staff' AND client_id IN (SELECT client_id FROM staff_assignments WHERE user_id = auth.uid()));

-- ═══════════════════════════════════════════════════════
-- STORAGE BUCKET
-- ═══════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);