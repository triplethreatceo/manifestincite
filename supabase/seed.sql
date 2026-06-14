-- ManifestIncite Seed Data
-- Run this after creating an admin user in Supabase Auth
-- Replace the user ID below with your actual admin user UUID

-- ═══════════════════════════════════════════════════════
-- TEST CLIENT
-- ═══════════════════════════════════════════════════════

INSERT INTO clients (id, company_legal_name, dba_name, dot_number, mc_number, ein, business_address, contact_person, phone, email, start_date, status, monthly_service_fee, compliance_status)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Southeastern Freight Lines LLC', 'SE Freight', '1234567', 'MC-654321', '12-3456789', '100 Truckstop Way, Charlotte, NC 28202', 'Marcus Johnson', '704-555-0100', 'mjohnson@sefreight.example.com', '2025-01-15', 'active', 499.00, 'yellow'),
  ('a0000000-0000-0000-0000-000000000002', 'Blue Ridge Hauling Inc', NULL, '2345678', 'MC-876543', '23-4567890', '200 Mountain Rd, Asheville, NC 28801', 'Sarah Davis', '828-555-0200', 'sdavis@blueridgehauling.example.com', '2025-03-01', 'active', 349.00, 'green'),
  ('a0000000-0000-0000-0000-000000000003', 'Piedmont Transport Co', 'Piedmont Trans', '3456789', NULL, '34-5678901', '300 Piedmont Ave, Greensboro, NC 27401', 'James Lee', '336-555-0300', 'jlee@piedmonttrans.example.com', '2024-11-01', 'active', 499.00, 'red');

-- ═══════════════════════════════════════════════════════
-- DRIVERS — Client 1 (SE Freight)
-- ═══════════════════════════════════════════════════════

INSERT INTO drivers (id, client_id, full_name, phone, email, cdl_number, cdl_state, cdl_expiration_date, medical_card_expiration_date, mvr_date, background_check_date, drug_test_date, clearinghouse_query_date, employment_application_status, driver_qualification_file_status, status)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Robert Williams', '704-555-1001', 'rwilliams@sefreight.example.com', 'CDL-NC-90001', 'NC', '2026-09-15', '2026-08-01', '2026-02-10', '2025-06-01', '2026-03-15', '2026-01-20', 'approved', 'complete', 'active'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Angela Martinez', '704-555-1002', 'amartinez@sefreight.example.com', 'CDL-NC-90002', 'NC', '2026-07-10', '2026-06-25', '2025-11-05', '2025-05-20', '2025-12-01', '2025-10-15', 'approved', 'complete', 'active'),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Thomas Clark', '704-555-1003', 'tclark@sefreight.example.com', 'CDL-SC-90003', 'SC', '2026-06-20', '2026-06-18', '2025-04-10', '2025-03-15', '2025-05-01', '2025-06-01', 'approved', 'needs_review', 'active');

-- ═══════════════════════════════════════════════════════
-- DRIVERS — Client 2 (Blue Ridge)
-- ═══════════════════════════════════════════════════════

INSERT INTO drivers (id, client_id, full_name, phone, email, cdl_number, cdl_state, cdl_expiration_date, medical_card_expiration_date, mvr_date, background_check_date, drug_test_date, clearinghouse_query_date, employment_application_status, driver_qualification_file_status, status)
VALUES
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'Patricia Evans', '828-555-2001', 'pevans@blueridgehauling.example.com', 'CDL-NC-80001', 'NC', '2027-03-20', '2027-01-15', '2026-04-01', '2026-03-01', '2026-05-10', '2026-04-20', 'approved', 'complete', 'active'),
  ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'David Kim', '828-555-2002', 'dkim@blueridgehauling.example.com', 'CDL-NC-80002', 'NC', '2027-05-01', '2026-12-10', '2026-05-15', '2026-04-01', '2026-06-01', '2026-05-01', 'approved', 'complete', 'active');

-- ═══════════════════════════════════════════════════════
-- DRIVERS — Client 3 (Piedmont) — has compliance issues
-- ═══════════════════════════════════════════════════════

INSERT INTO drivers (id, client_id, full_name, phone, email, cdl_number, cdl_state, cdl_expiration_date, medical_card_expiration_date, mvr_date, background_check_date, drug_test_date, clearinghouse_query_date, employment_application_status, driver_qualification_file_status, status)
VALUES
  ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'Michael Brown', '336-555-3001', 'mbrown@piedmonttrans.example.com', 'CDL-NC-70001', 'NC', '2026-06-25', '2026-06-20', '2025-03-01', '2025-01-15', '2025-02-01', '2025-01-10', 'approved', 'needs_review', 'active'),
  ('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 'Jennifer Taylor', '336-555-3002', 'jtaylor@piedmonttrans.example.com', NULL, 'NC', NULL, NULL, NULL, NULL, NULL, NULL, 'pending', 'incomplete', 'active');

-- ═══════════════════════════════════════════════════════
-- VEHICLES — Client 1
-- ═══════════════════════════════════════════════════════

INSERT INTO vehicles (id, client_id, unit_number, vin, year, make, model, plate_number, registration_state, registration_expiration_date, insurance_expiration_date, annual_inspection_due_date, status)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '101', '1HGCM82633A004352', 2022, 'Freightliner', 'Cascadia', 'NC-TRK-101', 'NC', '2027-01-15', '2027-02-01', '2026-12-01', 'active'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '102', '1HGCM82633A004353', 2021, 'Kenworth', 'T680', 'NC-TRK-102', 'NC', '2026-08-20', '2027-02-01', '2026-09-15', 'active'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '103', '1HGCM82633A004354', 2020, 'Peterbilt', '579', 'SC-TRK-103', 'SC', '2026-07-05', '2026-07-10', '2026-08-01', 'active');

-- ═══════════════════════════════════════════════════════
-- VEHICLES — Client 2
-- ═══════════════════════════════════════════════════════

INSERT INTO vehicles (id, client_id, unit_number, vin, year, make, model, plate_number, registration_state, registration_expiration_date, insurance_expiration_date, annual_inspection_due_date, status)
VALUES
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', '201', '2HGCM82633A005001', 2023, 'Volvo', 'VNL 860', 'NC-TRK-201', 'NC', '2027-06-01', '2027-05-15', '2027-03-01', 'active'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', '202', '2HGCM82633A005002', 2022, 'International', 'LT', 'NC-TRK-202', 'NC', '2027-04-10', '2027-05-15', '2027-01-15', 'active');

-- ═══════════════════════════════════════════════════════
-- VEHICLES — Client 3 — some with upcoming expirations
-- ═══════════════════════════════════════════════════════

INSERT INTO vehicles (id, client_id, unit_number, vin, year, make, model, plate_number, registration_state, registration_expiration_date, insurance_expiration_date, annual_inspection_due_date, status)
VALUES
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', '301', '3HGCM82633A006001', 2019, 'Mack', 'Anthem', 'NC-TRK-301', 'NC', '2026-06-28', '2026-06-30', '2026-06-15', 'active'),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', '302', '3HGCM82633A006002', 2018, 'Freightliner', 'Cascadia', 'NC-TRK-302', 'NC', '2026-06-10', '2026-06-05', '2026-05-30', 'active');

-- ═══════════════════════════════════════════════════════
-- ASSIGN VEHICLES TO DRIVERS
-- ═══════════════════════════════════════════════════════

UPDATE drivers SET assigned_vehicle_id = 'b0000000-0000-0000-0000-000000000001' WHERE id = 'd0000000-0000-0000-0000-000000000001';
UPDATE drivers SET assigned_vehicle_id = 'b0000000-0000-0000-0000-000000000002' WHERE id = 'd0000000-0000-0000-0000-000000000002';
UPDATE drivers SET assigned_vehicle_id = 'b0000000-0000-0000-0000-000000000004' WHERE id = 'd0000000-0000-0000-0000-000000000004';
UPDATE drivers SET assigned_vehicle_id = 'b0000000-0000-0000-0000-000000000006' WHERE id = 'd0000000-0000-0000-0000-000000000006';

-- ═══════════════════════════════════════════════════════
-- INVOICES
-- ═══════════════════════════════════════════════════════

INSERT INTO invoices (id, client_id, invoice_number, amount, amount_paid, status, invoice_date, due_date, notes)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'INV-2026-001', 499.00, 499.00, 'paid', '2026-05-01', '2026-05-31', 'Monthly compliance management — May 2026'),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'INV-2026-002', 499.00, 0.00, 'unpaid', '2026-06-01', '2026-06-30', 'Monthly compliance management — June 2026'),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'INV-2026-003', 349.00, 349.00, 'paid', '2026-06-01', '2026-06-30', 'Monthly compliance management — June 2026'),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'INV-2026-004', 499.00, 0.00, 'overdue', '2026-05-01', '2026-05-31', 'Monthly compliance management — May 2026'),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'INV-2026-005', 499.00, 0.00, 'unpaid', '2026-06-01', '2026-06-30', 'Monthly compliance management — June 2026');

-- ═══════════════════════════════════════════════════════
-- ALERTS (pre-seeded, will also be created by alert engine)
-- ═══════════════════════════════════════════════════════


INSERT INTO alerts (id, client_id, category, driver_id, vehicle_id, title, description, severity, status, due_date)
VALUES
  ('ae000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'driver_compliance', 'd0000000-0000-0000-0000-000000000003', NULL, 'MVR Overdue — Thomas Clark', 'MVR has not been updated in over 12 months.', 'high', 'open', '2026-04-10'),
  ('ae000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'driver_compliance', 'd0000000-0000-0000-0000-000000000003', NULL, 'Clearinghouse Overdue — Thomas Clark', 'Clearinghouse query overdue.', 'high', 'open', '2026-06-01'),
  ('ae000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'driver_compliance', 'd0000000-0000-0000-0000-000000000006', NULL, 'Drug Test Overdue — Michael Brown', 'Drug test has not been updated in over 12 months.', 'critical', 'open', '2026-02-01'),
  ('ae000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'driver_compliance', 'd0000000-0000-0000-0000-000000000007', NULL, 'Missing CDL — Jennifer Taylor', 'Driver has no CDL number on file.', 'critical', 'open', NULL),
  ('ae000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'vehicle_compliance', NULL, 'b0000000-0000-0000-0000-000000000007', 'Insurance Expired — Unit 302', 'Vehicle insurance has expired.', 'critical', 'open', '2026-06-05'),
  ('ae000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'vehicle_compliance', NULL, 'b0000000-0000-0000-0000-000000000006', 'Registration Expiring — Unit 301', 'Vehicle registration expires within 30 days.', 'medium', 'open', '2026-06-28'),
  ('ae000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 'billing', NULL, NULL, 'Invoice Overdue — INV-2026-004', 'Invoice is past due.', 'high', 'open', '2026-05-31');

-- ═══════════════════════════════════════════════════════
-- TASKS
-- ═══════════════════════════════════════════════════════

INSERT INTO tasks (id, client_id, title, description, status, priority, due_date)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Collect updated MVR for Thomas Clark', 'MVR is over 12 months old — request new MVR from driver.', 'pending', 'high', '2026-06-20'),
  ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Follow up on Jennifer Taylor DQ file', 'New driver file is incomplete — missing CDL, medical card, drug test.', 'in_progress', 'urgent', '2026-06-15'),
  ('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Renew insurance for Unit 302', 'Insurance expired 2026-06-05. Contact carrier for proof of renewal.', 'pending', 'urgent', '2026-06-13'),
  ('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'Quarterly compliance review — Blue Ridge', 'Scheduled Q2 audit review with client.', 'pending', 'medium', '2026-06-30');

-- ═══════════════════════════════════════════════════════
-- DRUG & ALCOHOL RECORDS
-- ═══════════════════════════════════════════════════════

INSERT INTO drug_alcohol_records (id, driver_id, client_id, test_date, test_type, result, status)
VALUES
  ('d4000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-03-15', 'random', 'negative', 'completed'),
  ('d4000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '2025-12-01', 'pre_employment', 'negative', 'completed'),
  ('d4000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', '2026-05-10', 'random', 'negative', 'completed'),
  ('d4000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', '2025-02-01', 'random', 'negative', 'completed');

-- ═══════════════════════════════════════════════════════
-- CLEARINGHOUSE RECORDS
-- ═══════════════════════════════════════════════════════

INSERT INTO clearinghouse_records (id, driver_id, client_id, query_date, query_type, result)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-01-20', 'limited', 'no_records_found'),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '2025-10-15', 'limited', 'no_records_found'),
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', '2026-04-20', 'limited', 'no_records_found'),
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', '2025-01-10', 'limited', 'no_records_found');

-- ═══════════════════════════════════════════════════════
-- VEHICLE MAINTENANCE RECORDS
-- ═══════════════════════════════════════════════════════

INSERT INTO vehicle_maintenance_records (id, vehicle_id, client_id, service_date, service_type, description, cost)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-05-01', 'Oil Change', 'Full synthetic oil change and filter', 350.00),
  ('b1000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-03-15', 'Tire Rotation', 'Rotated all tires, checked tread depth', 150.00),
  ('b1000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '2026-04-20', 'Brake Inspection', 'Inspected brake pads and rotors — within spec', 200.00),
  ('b1000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', '2026-02-10', 'Annual DOT Inspection', 'Passed with no deficiencies', 500.00);
