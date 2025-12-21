import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { carols } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Map titles to canonical artist/composer names for consistency
const TITLE_TO_ARTIST: Record<string, string> = {
  'Jingle Bells': 'James Lord Pierpont',
  'Silent Night': 'Traditional',
  'Deck the Halls': 'Traditional',
  'Hark! The Herald Angels Sing': 'Traditional',
  'O Come, All Ye Faithful': 'Traditional',
  'Joy to the World': 'Traditional',
  'The First Noel': 'Traditional',
  'Away in a Manger': 'Traditional',
  'We Wish You a Merry Christmas': 'Traditional',
  'God Rest Ye Merry, Gentlemen': 'Traditional',
  'Angels We Have Heard on High': 'Traditional',
  'It Came Upon the Midnight Clear': 'Traditional',
  'O Little Town of Bethlehem': 'Traditional',
  'Good King Wenceslas': 'Traditional',
  'What Child Is This?': 'Traditional',
};

async function main() {
  console.log('🧹 Normalizing artists...');

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

  const pool = mysql.createPool({
    host, port, user, password, database,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    connectionLimit: 1,
    maxIdle: 1,
    enableKeepAlive: true,
    waitForConnections: true,
  });
  const db = drizzle({ client: pool, schema: { carols }, mode: 'default' });

  try {
    const rows = await db.select().from(carols);
    let updates = 0;
    for (const row of rows as any[]) {
      const title: string = row.title;
      const preferred = TITLE_TO_ARTIST[title];
      if (!preferred) continue;
      if (row.artist !== preferred) {
        await db.update(carols).set({ artist: preferred }).where(eq(carols.id, row.id));
        updates++;
        console.log(`✅ Updated artist: ${title} => ${preferred}`);
      }
    }
    console.log(`🎉 Normalization complete. Updated ${updates} rows.`);
  } catch (err) {
    console.error('❌ Normalization failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
