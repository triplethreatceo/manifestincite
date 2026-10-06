-- Migration: Add missing columns to loads table
-- The loads table exists from 00004 but is missing columns referenced by the app

-- Add missing columns to loads
ALTER TABLE loads ADD COLUMN IF NOT EXISTS deadhead_miles NUMERIC;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS rate_per_mile NUMERIC;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS dispatch_fee_percent NUMERIC DEFAULT 8;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS dispatch_fee_amount NUMERIC;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS driver_pay NUMERIC;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS fuel_cost NUMERIC;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS equipment_type TEXT;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS freight_type TEXT;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS broker_name TEXT;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS broker_email TEXT;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS broker_phone TEXT;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS shipping_hours TEXT;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS receiving_hours TEXT;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS rate_con_received BOOLEAN DEFAULT FALSE;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS bol_submitted BOOLEAN DEFAULT FALSE;
ALTER TABLE loads ADD COLUMN IF NOT EXISTS invoiced BOOLEAN DEFAULT FALSE;

-- Make load_number globally unique (not just per-client)
DROP INDEX IF EXISTS idx_loads_number_client;
ALTER TABLE loads ADD CONSTRAINT loads_load_number_unique UNIQUE (load_number);

-- Drop view before altering column types (view depends on these columns)
DROP VIEW IF EXISTS loads_staff_view;

-- Widen rate precision (was NUMERIC(10,2), make it NUMERIC for flexibility)
ALTER TABLE loads ALTER COLUMN rate TYPE NUMERIC;
-- Widen miles/weight from INTEGER to NUMERIC for decimal support
ALTER TABLE loads ALTER COLUMN miles TYPE NUMERIC;
ALTER TABLE loads ALTER COLUMN weight TYPE NUMERIC;

-- Change pickup/delivery window columns from TIME to TEXT (app uses text like "8am-3pm")
ALTER TABLE loads ALTER COLUMN pickup_window_start TYPE TEXT USING pickup_window_start::TEXT;
ALTER TABLE loads ALTER COLUMN pickup_window_end TYPE TEXT USING pickup_window_end::TEXT;
ALTER TABLE loads ALTER COLUMN delivery_window_start TYPE TEXT USING delivery_window_start::TEXT;
ALTER TABLE loads ALTER COLUMN delivery_window_end TYPE TEXT USING delivery_window_end::TEXT;

-- Recreate the loads_staff_view with all columns
CREATE OR REPLACE VIEW loads_staff_view AS
SELECT
  id, client_id, load_number, status, driver_id, vehicle_id, dispatcher_id,
  origin_name, origin_address, origin_city, origin_state, origin_zip,
  destination_name, destination_address, destination_city, destination_state, destination_zip,
  pickup_date, pickup_window_start, pickup_window_end,
  delivery_date, delivery_window_start, delivery_window_end,
  miles, deadhead_miles, weight, commodity, equipment_type, freight_type,
  broker_name, broker_email, broker_phone,
  shipping_hours, receiving_hours, reference_numbers,
  special_instructions, notes,
  bol_submitted, rate_con_received, invoiced,
  actual_pickup_time, actual_delivery_time,
  created_at, updated_at
FROM loads;

GRANT SELECT ON loads_staff_view TO authenticated;