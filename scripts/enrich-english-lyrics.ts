import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { carols } from '../shared/schema';
import { and, eq, isNull } from 'drizzle-orm';

// Public-domain lyrics snippets. Keep concise verses; verify PD status.
const LYRICS: Record<string, string[]> = {
  'Silent Night|Traditional': [
    'Silent night, holy night! All is calm, all is bright,',
    'Round yon Virgin, Mother and Child. Holy infant so tender and mild,',
    'Sleep in heavenly peace, sleep in heavenly peace.'
  ],
  'Jingle Bells|James Lord Pierpont': [
    'Dashing through the snow, in a one-horse open sleigh,',
    'O’er the fields we go, laughing all the way;',
    'Bells on bobtails ring, making spirits bright,',
    'What fun it is to ride and sing a sleighing song tonight!'
  ],
  'Hark! The Herald Angels Sing|Traditional': [
    'Hark! the herald angels sing, “Glory to the newborn King;”',
    'Peace on earth, and mercy mild, God and sinners reconciled!'
  ],
  'O Come, All Ye Faithful|Traditional': [
    'O come, all ye faithful, joyful and triumphant,',
    'O come ye, O come ye to Bethlehem.'
  ],
  'Joy to the World|Traditional': [
    'Joy to the world! the Lord is come; let earth receive her King;',
    'Let every heart prepare Him room, and heaven and nature sing.'
  ],
  'Deck the Halls|Traditional': [
    'Deck the halls with boughs of holly, fa la la la la, la la la la.',
    "'Tis the season to be jolly, fa la la la la, la la la la."
  ],
  'The First Noel|Traditional': [
    'The first Noel, the angels did say, was to certain poor shepherds in fields as they lay;',
    'In fields where they lay keeping their sheep, on a cold winter’s night that was so deep.'
  ],
  'Away in a Manger|Traditional': [
    'Away in a manger, no crib for a bed,',
    'The little Lord Jesus laid down His sweet head;'
  ],
};

async function main() {
  console.log('✨ Enriching English carols with language and PD lyrics...');

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
    // Ensure language column exists
    await pool.query("ALTER TABLE carols ADD COLUMN language VARCHAR(10) DEFAULT 'en'").catch(() => {});

    for (const key of Object.keys(LYRICS)) {
      const [title, artist] = key.split('|');
      const lyrics = LYRICS[key];

      const rows = await db.select().from(carols)
        .where(and(eq(carols.title, title), eq(carols.artist, artist)));

      if (rows.length === 0) {
        console.log(`ℹ️ Not found, skipping: ${title} — ${artist}`);
        continue;
      }

      for (const row of rows) {
        await db.update(carols)
          .set({ lyrics, language: 'en' })
          .where(eq(carols.id, (row as any).id));
        console.log(`✅ Updated lyrics: ${title}`);
      }
    }

    // Set language='en' for all remaining entries with null/empty language
    const all = await db.select({ id: carols.id }).from(carols);
    for (const r of all) {
      await db.update(carols).set({ language: 'en' }).where(eq(carols.id, (r as any).id));
    }

    console.log('🎉 Enrichment complete.');
  } catch (err) {
    console.error('❌ Enrichment failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
