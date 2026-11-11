import pg from 'pg';
import { getRequiredEnv } from './load-env.mjs';
const { Client } = pg;

const regions = [
  'ap-south-1',       // Mumbai
  'ap-southeast-1',   // Singapore
  'eu-central-1',     // Frankfurt
  'eu-west-1',        // Ireland
  'us-east-1',        // N. Virginia
  'us-east-2',        // Ohio
  'us-west-1',        // Oregon
  'ap-northeast-1',   // Tokyo
];

const password = getRequiredEnv('SUPABASE_DB_PASSWORD');
const user = getRequiredEnv('SUPABASE_DB_USER');

async function probe() {
  for (const reg of regions) {
    const host = `aws-0-${reg}.pooler.supabase.com`;
    console.log(`Probing ${host}...`);
    const client = new Client({
      host,
      port: 6543,
      user,
      password,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 4000,
    });
    try {
      await client.connect();
      console.log(`>>> SUCCESS! Connected to ${host}`);
      const res = await client.query('SELECT current_database(), current_user;');
      console.log('Query result:', res.rows[0]);
      await client.end();
      return host;
    } catch (err) {
      console.log(`Failed on ${reg}: ${err.message}`);
    }
  }
}

probe();
