#!/usr/bin/env node
// Runs the GhostIn Supabase schema migration
// Usage: SUPABASE_URL=https://xxx.supabase.co SERVICE_ROLE_KEY=<key> node scripts/setup-db.mjs
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;
const PROJECT_REF = SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SERVICE_ROLE_KEY environment variables.');
  console.error('Example:');
  console.error('  SUPABASE_URL=https://xxx.supabase.co SERVICE_ROLE_KEY=sb_secret_... node scripts/setup-db.mjs');
  process.exit(1);
}

const schemaPath = resolve(__dirname, '../supabase/migrations/001_ghostin_schema.sql');
const sql = readFileSync(schemaPath, 'utf8');

async function runSql(query) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    }
  );
  return { status: res.status, body: await res.text() };
}

async function main() {
  console.log('Applying GhostIn schema to project:', PROJECT_REF);
  const { status, body } = await runSql(sql);
  if (status === 200 || status === 201) {
    console.log('✓ Schema applied successfully');
    return;
  }
  console.log(`Status ${status}:`, body.slice(0, 300));
  console.log('\nIf this failed, paste supabase/migrations/001_ghostin_schema.sql');
  console.log(`into: https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
