import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { carols } from '../shared/schema';
import { inArray, and, eq } from 'drizzle-orm';

const NON_ENGLISH_TAGS = new Set([
  'French','German','Spanish','Italian','Latin','Welsh','Hebrew','Catalan','Polish','Irish','Canadian','Indigenous','Hebrew','Hanukkah','Greek','Russian','Ukrainian'
]);

const NON_ENGLISH_MARKERS = [
  '(French', '(German', '(Spanish', '(Italian', '(Latin', '(Welsh', '(Hebrew', '(Catalan', '(Polish', '(Irish', '(Canadian', '(Indigenous', '(Greek', '(Russian', '(Ukrainian'
];

async function main() {
  console.log('🧹 Purging non-English carols...');

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
    const toDeleteIds: string[] = [];

    for (const r of rows) {
      const title: string = (r as any).title || '';
      const tags: string[] = ((r as any).tags as any[]) || [];

      const hasNonEnglishTag = tags.some(t => NON_ENGLISH_TAGS.has(String(t)));
      const hasMarkerInTitle = NON_ENGLISH_MARKERS.some(m => title.includes(m));

      if (hasNonEnglishTag || hasMarkerInTitle) {
        toDeleteIds.push((r as any).id);
      }
    }

    if (toDeleteIds.length) {
      console.log(`Deleting ${toDeleteIds.length} non-English entries...`);
      // Delete in chunks to avoid large IN clauses
      const chunkSize = 50;
      for (let i = 0; i < toDeleteIds.length; i += chunkSize) {
        const chunk = toDeleteIds.slice(i, i + chunkSize);
        await db.delete(carols).where(inArray(carols.id, chunk));
      }
    } else {
      console.log('No non-English entries detected by heuristic.');
    }

    const remain = await db.select({ id: carols.id }).from(carols);
    console.log(`Remaining carols: ${remain.length}`);
    console.log('✅ Purge complete.');
  } catch (err) {
    console.error('❌ Purge failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
