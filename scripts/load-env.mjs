import fs from 'node:fs';
import path from 'node:path';

/**
 * Loads variables from `.env.local` into `process.env` when not already set.
 * Keeps secrets out of source code so CLI scripts never commit hardcoded credentials.
 */
export function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

export function getRequiredEnv(name) {
  loadLocalEnv();
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Set it in .env.local or your shell.`);
  }
  return value;
}

export function getPgConfig() {
  return {
    host: getRequiredEnv('SUPABASE_DB_HOST'),
    port: Number(process.env.SUPABASE_DB_PORT || 6543),
    user: getRequiredEnv('SUPABASE_DB_USER'),
    password: getRequiredEnv('SUPABASE_DB_PASSWORD'),
    database: process.env.SUPABASE_DB_NAME || 'postgres',
    ssl: { rejectUnauthorized: false },
  };
}
