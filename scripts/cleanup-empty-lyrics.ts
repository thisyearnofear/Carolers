import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { carols } from '../shared/schema';
import { isNull, eq, sql } from 'drizzle-orm';

async function cleanupEmptyLyrics() {
  console.log('🧹 Cleaning up carols with empty lyrics...\n');

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
    host,
    port,
    user,
    password,
    database,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    connectionLimit: 1,
    maxIdle: 1,
    enableKeepAlive: true,
    waitForConnections: true,
  });

  const db = drizzle({ client: pool, schema: { carols }, mode: 'default' });

  try {
    // Get all carols
    const allCarols = await db.select().from(carols);
    
    // Find carols with empty lyrics
    const emptyLyricsCarols = allCarols.filter(carol => {
      const lyrics = carol.lyrics as unknown;
      if (Array.isArray(lyrics)) {
        return lyrics.length === 0;
      }
      return !lyrics;
    });

    if (emptyLyricsCarols.length === 0) {
      console.log('✅ No carols with empty lyrics found!');
      process.exit(0);
    }

    console.log(`Found ${emptyLyricsCarols.length} carols with empty lyrics:\n`);
    emptyLyricsCarols.forEach(carol => {
      console.log(`  • ${carol.title} (ID: ${carol.id})`);
    });

    console.log('\n🗑️  Deleting...\n');

    // Delete carols with empty lyrics
    for (const carol of emptyLyricsCarols) {
      await db.delete(carols).where(eq(carols.id, carol.id));
      console.log(`✅ Deleted: ${carol.title}`);
    }

    console.log(`\n✨ Cleanup complete! Removed ${emptyLyricsCarols.length} carols.`);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

cleanupEmptyLyrics();
