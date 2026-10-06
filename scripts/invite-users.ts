/**
 * Bulk invite users from a CSV file.
 *
 * Usage:
 *   npx tsx scripts/invite-users.ts path/to/users.csv
 *
 * CSV format (first row is a header):
 *   name,email,role
 *   Jane Doe,jane@example.com,admin
 *   John Smith,john@example.com,staff
 *
 * Environment variables required (from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_APP_URL
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local
const envPath = resolve(__dirname, '..', '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // .env.local might not exist if env vars are set another way
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !APP_URL) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_APP_URL');
  process.exit(1);
}

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: npx tsx scripts/invite-users.ts path/to/users.csv');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface Row {
  name: string;
  email: string;
  role: string;
}

function parseCSV(content: string): Row[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  // Skip header
  return lines.slice(1).map((line) => {
    const parts = line.split(',').map((s) => s.trim());
    return { name: parts[0], email: parts[1], role: parts[2] };
  }).filter((r) => r.name && r.email && r.role);
}

async function main() {
  const content = readFileSync(resolve(csvPath), 'utf-8');
  const rows = parseCSV(content);

  if (rows.length === 0) {
    console.log('No valid rows found in CSV.');
    return;
  }

  console.log(`Found ${rows.length} users to invite.\n`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    // Check if already exists
    const { data: existing } = await admin
      .from('users')
      .select('id')
      .eq('email', row.email)
      .single();

    if (existing) {
      console.log(`  SKIP  ${row.email} — already exists`);
      skipped++;
      continue;
    }

    if (!['admin', 'staff'].includes(row.role)) {
      console.log(`  FAIL  ${row.email} — invalid role "${row.role}"`);
      failed++;
      continue;
    }

    const redirectTo = `${APP_URL}/auth/set-password`;

    const { data: authUser, error: authError } = await admin.auth.admin.inviteUserByEmail(
      row.email,
      {
        data: { full_name: row.name, role: row.role },
        redirectTo,
      }
    );

    if (authError) {
      console.log(`  FAIL  ${row.email} — ${authError.message}`);
      failed++;
      continue;
    }

    // Update auto-created users row
    await admin
      .from('users')
      .update({ full_name: row.name, role: row.role })
      .eq('id', authUser.user.id);

    console.log(`  OK    ${row.email} (${row.role})`);
    created++;
  }

  console.log(`\nSummary: ${created} invited, ${skipped} skipped, ${failed} failed.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});