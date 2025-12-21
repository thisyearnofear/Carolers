import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

function getEnv(key: string) {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return process.env[key];
  const envFile = fs.readFileSync(envPath, 'utf-8');
  const lines = envFile.split('\n');
  for (const line of lines) {
    const [k, ...rest] = line.split('=');
    if (k?.trim() === key) {
      const v = rest.join('=');
      return v?.trim().replace(/^['"]|['"]$/g, '');
    }
  }
  return process.env[key];
}

function parseMysqlUrl(urlStr: string) {
  // mysql://user:pass@host:port/db?...
  const base = urlStr.split('?')[0];
  const u = new URL(base);
  return {
    host: u.hostname,
    port: parseInt(u.port || '3306'),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ''),
  } as const;
}

async function checkSchema() {
  const dbUrl = getEnv('DATABASE_URL');
  if (!dbUrl) {
    console.error('DATABASE_URL not found in env');
    process.exit(1);
  }

  const cfg = parseMysqlUrl(dbUrl);

  // Use explicit SSL object; mysql2 does not support JSON ssl in URL
  const connection = await mysql.createConnection({
    ...cfg,
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
  });

  console.log('🔍 Inspecting carols table schema...');

  try {
    const [rows] = await connection.query('DESCRIBE carols');
    console.log('Columns in carols table:');
    console.table(rows as any);

    const [indexes] = await connection.query('SHOW INDEX FROM carols');
    console.log('Indexes in carols table:');
    console.table(indexes as any);

    const [count] = await connection.query('SELECT COUNT(*) AS count FROM carols');
    console.log('Row count in carols:', count);

    const [sample] = await connection.query('SELECT id, title, artist, votes FROM carols LIMIT 5');
    console.log('Sample carols:', sample);
  } catch (error) {
    console.error('❌ Error inspecting schema:', error);
  } finally {
    await connection.end();
  }
}

checkSchema().then(() => process.exit(0));
