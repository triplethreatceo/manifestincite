-- ManifestIncite — Phase 3B: Dispatch Enhancements
-- Fields from client's actual dispatch workflow + analytics support

-- ═══════════════════════════════════════════════════════
-- EXTEND LOADS — broker, financial, and operational fields
-- ═══════════════════════════════════════════════════════

ALTER TABLE loads
  -- Broker info (who books the load)
  ADD COLUMN broker_name TEXT,
  ADD COLUMN broker_email TEXT,
  ADD COLUMN broker_phone TEXT,

  -- Deadhead & rate per mile
  ADD COLUMN deadhead_miles INTEGER,
  ADD COLUMN rate_per_mile NUMERIC(6,2),

  -- Revenue & driver pay
  ADD COLUMN dispatch_fee_percent NUMERIC(5,2) DEFAULT 8.00,
  ADD COLUMN dispatch_fee_amount NUMERIC(10,2),
  ADD COLUMN driver_pay NUMERIC(10,2),
  ADD COLUMN fuel_cost NUMERIC(10,2),

  -- Equipment & freight type
  ADD COLUMN equipment_type TEXT,
  ADD COLUMN freight_type TEXT,

  -- Facility hours
  ADD COLUMN shipping_hours TEXT,
  ADD COLUMN receiving_hours TEXT,

  -- Workflow flags
  ADD COLUMN bol_submitted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN rate_con_received BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN invoiced BOOLEAN NOT NULL DEFAULT false;

-- Index for analytics queries
CREATE INDEX idx_loads_broker ON loads(broker_name);
CREATE INDEX idx_loads_equipment ON loads(equipment_type);
CREATE INDEX idx_loads_freight ON loads(freight_type);