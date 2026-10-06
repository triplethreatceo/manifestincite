-- Migration: Enforce financial data hiding for staff at the database level
-- Staff users cannot read invoices or payments tables.
-- For loads, we create a view that excludes financial columns.

-- Helper function: is_admin()
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── Invoices: staff cannot access ───

-- Drop existing policies on invoices (they currently allow staff read)
DROP POLICY IF EXISTS invoices_admin ON invoices;
DROP POLICY IF EXISTS invoices_staff ON invoices;
DROP POLICY IF EXISTS invoices_client ON invoices;

-- Only admins get full access to invoices
CREATE POLICY invoices_admin ON invoices FOR ALL
  USING (is_admin());

-- Clients can read their own invoices
CREATE POLICY invoices_client ON invoices FOR SELECT
  USING (get_user_role() = 'client' AND client_id IN (
    SELECT client_id FROM client_users WHERE user_id = auth.uid()
  ));

-- ─── Payments: staff cannot access ───

DROP POLICY IF EXISTS payments_admin ON payments;
DROP POLICY IF EXISTS payments_staff ON payments;
DROP POLICY IF EXISTS payments_client ON payments;

CREATE POLICY payments_admin ON payments FOR ALL
  USING (is_admin());

CREATE POLICY payments_client ON payments FOR SELECT
  USING (get_user_role() = 'client' AND invoice_id IN (
    SELECT id FROM invoices WHERE client_id IN (
      SELECT client_id FROM client_users WHERE user_id = auth.uid()
    )
  ));

-- ─── Loads view for staff (excludes financial columns) ───
-- Note: The app uses the admin client (service role) for all queries,
-- so these RLS policies serve as a defense-in-depth measure.
-- The primary enforcement is in the application layer (stripFinancialFields).

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

-- Grant access to the view for authenticated users
GRANT SELECT ON loads_staff_view TO authenticated;