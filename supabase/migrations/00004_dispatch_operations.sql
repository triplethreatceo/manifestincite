-- ManifestIncite — Phase 3: Carrier Dispatch & Operations
-- Dispatch, load tracking, trip documents, internal messaging

-- ═══════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════

CREATE TYPE load_status AS ENUM (
  'created',
  'assigned',
  'accepted',
  'en_route_pickup',
  'at_pickup',
  'loaded',
  'in_transit',
  'at_delivery',
  'delivered',
  'completed',
  'cancelled'
);

CREATE TYPE load_document_type AS ENUM (
  'rate_confirmation',
  'bill_of_lading',
  'proof_of_delivery',
  'invoice',
  'lumper_receipt',
  'scale_ticket',
  'other'
);

-- ═══════════════════════════════════════════════════════
-- LOADS
-- ═══════════════════════════════════════════════════════

CREATE TABLE loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  load_number TEXT NOT NULL,
  status load_status NOT NULL DEFAULT 'created',

  -- Assignment
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  dispatcher_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Origin
  origin_name TEXT NOT NULL,
  origin_address TEXT NOT NULL,
  origin_city TEXT NOT NULL,
  origin_state TEXT NOT NULL,
  origin_zip TEXT,

  -- Destination
  destination_name TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_state TEXT NOT NULL,
  destination_zip TEXT,

  -- Schedule
  pickup_date DATE NOT NULL,
  pickup_window_start TIME,
  pickup_window_end TIME,
  delivery_date DATE,
  delivery_window_start TIME,
  delivery_window_end TIME,

  -- Financials
  rate NUMERIC(10,2),
  rate_type TEXT DEFAULT 'flat',
  miles INTEGER,
  weight INTEGER,
  commodity TEXT,

  -- Tracking
  actual_pickup_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  reference_numbers TEXT,
  special_instructions TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_loads_client ON loads(client_id);
CREATE INDEX idx_loads_driver ON loads(driver_id);
CREATE INDEX idx_loads_status ON loads(status);
CREATE INDEX idx_loads_pickup_date ON loads(pickup_date);
CREATE UNIQUE INDEX idx_loads_number_client ON loads(client_id, load_number);

-- ═══════════════════════════════════════════════════════
-- LOAD STATUS UPDATES (trip lifecycle)
-- ═══════════════════════════════════════════════════════

CREATE TABLE load_status_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  status load_status NOT NULL,
  updated_by UUID NOT NULL REFERENCES users(id),
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_load_status_updates_load ON load_status_updates(load_id);

-- ═══════════════════════════════════════════════════════
-- LOAD DOCUMENTS
-- ═══════════════════════════════════════════════════════

CREATE TABLE load_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  document_type load_document_type NOT NULL,
  document_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_load_documents_load ON load_documents(load_id);

-- ═══════════════════════════════════════════════════════
-- MESSAGES (scoped per load or per driver)
-- ═══════════════════════════════════════════════════════

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID REFERENCES loads(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT messages_scope CHECK (load_id IS NOT NULL OR driver_id IS NOT NULL)
);

CREATE INDEX idx_messages_load ON messages(load_id);
CREATE INDEX idx_messages_driver ON messages(driver_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- ═══════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════

ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Loads
CREATE POLICY "Admin/staff full access to loads"
  ON loads FOR ALL
  USING (get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Clients view own loads"
  ON loads FOR SELECT
  USING (
    get_user_role() = 'client'
    AND client_id IN (SELECT client_id FROM client_users WHERE user_id = auth.uid())
  );

-- Load status updates
CREATE POLICY "Admin/staff full access to load status updates"
  ON load_status_updates FOR ALL
  USING (get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Clients view own load status updates"
  ON load_status_updates FOR SELECT
  USING (
    get_user_role() = 'client'
    AND load_id IN (
      SELECT id FROM loads WHERE client_id IN (
        SELECT client_id FROM client_users WHERE user_id = auth.uid()
      )
    )
  );

-- Load documents
CREATE POLICY "Admin/staff full access to load documents"
  ON load_documents FOR ALL
  USING (get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Clients view own load documents"
  ON load_documents FOR SELECT
  USING (
    get_user_role() = 'client'
    AND load_id IN (
      SELECT id FROM loads WHERE client_id IN (
        SELECT client_id FROM client_users WHERE user_id = auth.uid()
      )
    )
  );

-- Messages
CREATE POLICY "Admin/staff full access to messages"
  ON messages FOR ALL
  USING (get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Clients view own messages"
  ON messages FOR SELECT
  USING (
    get_user_role() = 'client'
    AND (
      client_id IN (SELECT client_id FROM client_users WHERE user_id = auth.uid())
      OR sender_id = auth.uid()
    )
  );

-- Triggers
CREATE TRIGGER update_loads_updated_at
  BEFORE UPDATE ON loads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();