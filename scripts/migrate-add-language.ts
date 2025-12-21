import mysql from 'mysql2/promise';

async function main() {
  const urlStr = (process.env.DATABASE_URL || '').split('?')[0];
  if (!urlStr) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }
  const url = new URL(urlStr);
  const host = url.hostname;
  const port = parseInt(url.port || '3306');
  const user = url.username;
  const password = decodeURIComponent(url.password);
  const database = url.pathname.slice(1);

  const conn = await mysql.createConnection({
    host, port, user, password, database,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  });

  try {
    console.log('🚀 Adding language column to carols if missing...');
    await conn.query("ALTER TABLE carols ADD COLUMN language VARCHAR(10) DEFAULT 'en'");
    console.log('✅ language column added');
  } catch (e: any) {
    if (e.code === 'ER_DUP_FIELDNAME' || /Duplicate column/i.test(e.message)) {
      console.log('ℹ️ language column already exists');
    } else {
      console.error('❌ Failed to add language column:', e.message);
      process.exit(1);
    }
  } finally {
    await conn.end();
  }
}

main();
