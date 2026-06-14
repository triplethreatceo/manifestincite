-- ManifestIncite — Phase 2: Driver & Carrier Verification Network
-- Trust layer: verified profiles, employment references, hiring tools

-- ═══════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════

CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected', 'suspended');
CREATE TYPE reference_status AS ENUM ('pending', 'confirmed', 'disputed', 'withdrawn');
CREATE TYPE profile_visibility AS ENUM ('private', 'verified_carriers', 'public');
CREATE TYPE evaluation_decision AS ENUM ('hire', 'reject', 'hold', 'no_decision');

-- ═══════════════════════════════════════════════════════
-- EXTEND DRIVERS — verification fields
-- ═══════════════════════════════════════════════════════

ALTER TABLE drivers
  ADD COLUMN verification_status verification_status NOT NULL DEFAULT 'unverified',
  ADD COLUMN endorsements TEXT[],
  ADD COLUMN profile_visibility profile_visibility NOT NULL DEFAULT 'private',
  ADD COLUMN profile_bio TEXT,
  ADD COLUMN years_experience INTEGER,
  ADD COLUMN verified_at TIMESTAMPTZ,
  ADD COLUMN verified_by UUID REFERENCES users(id);

CREATE INDEX idx_drivers_verification ON drivers(verification_status);
CREATE INDEX idx_drivers_visibility ON drivers(profile_visibility);

-- ═══════════════════════════════════════════════════════
-- EXTEND CLIENTS — carrier verification fields
-- ═══════════════════════════════════════════════════════

ALTER TABLE clients
  ADD COLUMN carrier_verification_status verification_status NOT NULL DEFAULT 'unverified',
  ADD COLUMN safety_rating TEXT,
  ADD COLUMN fleet_size INTEGER,
  ADD COLUMN years_in_business INTEGER,
  ADD COLUMN carrier_verified_at TIMESTAMPTZ,
  ADD COLUMN carrier_verified_by UUID REFERENCES users(id),
  ADD COLUMN can_submit_references BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_clients_carrier_verification ON clients(carrier_verification_status);

-- ═══════════════════════════════════════════════════════
-- EMPLOYMENT REFERENCES
-- ═══════════════════════════════════════════════════════

CREATE TABLE employment_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES users(id),
  employment_start_date DATE NOT NULL,
  employment_end_date DATE,
  position TEXT NOT NULL,
  eligible_for_rehire BOOLEAN,
  reason_for_leaving TEXT,
  performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 5),
  comments TEXT,
  status reference_status NOT NULL DEFAULT 'pending',
  disputed_reason TEXT,
  verified_carrier_stamp BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_references_driver ON employment_references(driver_id);
CREATE INDEX idx_references_carrier ON employment_references(carrier_id);
CREATE INDEX idx_references_status ON employment_references(status);

-- ═══════════════════════════════════════════════════════
-- HIRING EVALUATIONS
-- ═══════════════════════════════════════════════════════

CREATE TABLE hiring_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  evaluated_by UUID NOT NULL REFERENCES users(id),
  decision evaluation_decision NOT NULL DEFAULT 'no_decision',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_evaluations_driver ON hiring_evaluations(driver_id);
CREATE INDEX idx_evaluations_carrier ON hiring_evaluations(carrier_id);

-- ═══════════════════════════════════════════════════════
-- PROFILE ACCESS REQUESTS (consent gate)
-- ═══════════════════════════════════════════════════════

CREATE TABLE profile_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  requesting_carrier_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(driver_id, requesting_carrier_id)
);

CREATE INDEX idx_access_requests_driver ON profile_access_requests(driver_id);
CREATE INDEX idx_access_requests_carrier ON profile_access_requests(requesting_carrier_id);

-- ═══════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════

ALTER TABLE employment_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE hiring_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_access_requests ENABLE ROW LEVEL SECURITY;

-- Employment references: admin/staff see all, clients see their own
CREATE POLICY "Admin/staff full access to references"
  ON employment_references FOR ALL
  USING (get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Clients view own references"
  ON employment_references FOR SELECT
  USING (
    get_user_role() = 'client'
    AND carrier_id IN (
      SELECT client_id FROM client_users WHERE user_id = auth.uid()
    )
  );

-- Hiring evaluations: admin/staff see all, clients see their own
CREATE POLICY "Admin/staff full access to evaluations"
  ON hiring_evaluations FOR ALL
  USING (get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Clients view own evaluations"
  ON hiring_evaluations FOR SELECT
  USING (
    get_user_role() = 'client'
    AND carrier_id IN (
      SELECT client_id FROM client_users WHERE user_id = auth.uid()
    )
  );

-- Profile access requests: admin/staff see all, clients see their own
CREATE POLICY "Admin/staff full access to access requests"
  ON profile_access_requests FOR ALL
  USING (get_user_role() IN ('admin', 'staff'));

CREATE POLICY "Clients view own access requests"
  ON profile_access_requests FOR SELECT
  USING (
    get_user_role() = 'client'
    AND requesting_carrier_id IN (
      SELECT client_id FROM client_users WHERE user_id = auth.uid()
    )
  );

-- Triggers
CREATE TRIGGER update_employment_references_updated_at
  BEFORE UPDATE ON employment_references
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_hiring_evaluations_updated_at
  BEFORE UPDATE ON hiring_evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();