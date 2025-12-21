import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { carols } from '../shared/schema';
import { randomUUID } from 'crypto';
import { eq, and } from 'drizzle-orm';

// Expanded set of largely public-domain traditional carols. Lyrics omitted for brevity.
// You can safely adjust durations and tags later.
const MORE_CAROLS: Array<{
  title: string;
  artist: string;
  duration: string;
  energy: 'low' | 'medium' | 'high';
  tags: string[];
}> = [
  { title: 'O Come, All Ye Faithful', artist: 'Traditional', duration: '3:20', energy: 'medium', tags: ['Classic','Worship'] },
  { title: 'Hark! The Herald Angels Sing', artist: 'Traditional', duration: '3:30', energy: 'medium', tags: ['Classic','Choir'] },
  { title: 'Joy to the World', artist: 'Traditional', duration: '2:40', energy: 'high', tags: ['Classic','Upbeat'] },
  { title: 'O Little Town of Bethlehem', artist: 'Traditional', duration: '3:00', energy: 'low', tags: ['Classic','Solemn'] },
  { title: 'The First Noel', artist: 'Traditional', duration: '3:45', energy: 'medium', tags: ['Classic','Ballad'] },
  { title: 'We Wish You a Merry Christmas', artist: 'Traditional', duration: '1:55', energy: 'high', tags: ['Upbeat','Group'] },
  { title: 'God Rest Ye Merry, Gentlemen', artist: 'Traditional', duration: '3:10', energy: 'medium', tags: ['Classic'] },
  { title: 'Angels We Have Heard on High', artist: 'Traditional', duration: '3:05', energy: 'medium', tags: ['Classic','Choir'] },
  { title: 'It Came Upon the Midnight Clear', artist: 'Traditional', duration: '3:25', energy: 'low', tags: ['Classic','Calm'] },
  { title: 'Away in a Manger', artist: 'Traditional', duration: '2:20', energy: 'low', tags: ['Lullaby'] },
  { title: 'Good King Wenceslas', artist: 'Traditional', duration: '2:50', energy: 'medium', tags: ['Story','Classic'] },
  { title: 'What Child Is This?', artist: 'Traditional', duration: '2:55', energy: 'low', tags: ['Classic','Minor Key'] },
  { title: 'O Come, O Come, Emmanuel', artist: 'Traditional', duration: '3:35', energy: 'low', tags: ['Advent','Solemn'] },
  { title: 'While Shepherds Watched Their Flocks', artist: 'Traditional', duration: '2:50', energy: 'medium', tags: ['Classic'] },
  { title: 'I Saw Three Ships', artist: 'Traditional', duration: '2:00', energy: 'high', tags: ['Upbeat','Folk'] },
  { title: 'Ding Dong Merrily on High', artist: 'Traditional', duration: '2:30', energy: 'high', tags: ['Choir','Upbeat'] },
  { title: 'The Holly and the Ivy', artist: 'Traditional', duration: '2:40', energy: 'medium', tags: ['Folk','Classic'] },
  { title: 'Coventry Carol', artist: 'Traditional', duration: '2:45', energy: 'low', tags: ['Lament','Solemn'] },
  { title: 'Once in Royal David’s City', artist: 'Traditional', duration: '3:15', energy: 'low', tags: ['Processional'] },
  { title: 'In the Bleak Midwinter', artist: 'Traditional', duration: '3:20', energy: 'low', tags: ['Solemn'] },
  { title: 'Here We Come A-Wassailing', artist: 'Traditional', duration: '2:20', energy: 'high', tags: ['Upbeat','Tradition'] },
  { title: 'Patapan', artist: 'Traditional', duration: '2:10', energy: 'medium', tags: ['Folk','Rhythmic'] },
  { title: 'Lo, How a Rose E’er Blooming', artist: 'Traditional', duration: '2:50', energy: 'low', tags: ['Chorale'] },
  { title: 'Gaudete', artist: 'Traditional', duration: '2:10', energy: 'medium', tags: ['Latin','Renaissance'] },
  { title: 'Wexford Carol', artist: 'Traditional', duration: '3:30', energy: 'low', tags: ['Irish','Classic'] },
  { title: 'I Heard the Bells on Christmas Day', artist: 'Traditional', duration: '3:05', energy: 'medium', tags: ['Poem','Classic'] },
  { title: 'Carol of the Bells', artist: 'Traditional', duration: '1:30', energy: 'high', tags: ['Choir','Rhythmic'] },
  { title: 'Bring a Torch, Jeannette, Isabella', artist: 'Traditional', duration: '2:00', energy: 'medium', tags: ['French','Folk'] },
  { title: 'Go Tell It on the Mountain', artist: 'Traditional', duration: '2:45', energy: 'high', tags: ['Spiritual','Upbeat'] },
  { title: 'O Christmas Tree (O Tannenbaum)', artist: 'Traditional', duration: '2:15', energy: 'medium', tags: ['German','Classic'] },
  { title: 'We Three Kings', artist: 'Traditional', duration: '3:10', energy: 'medium', tags: ['Classic'] },
];

async function main() {
  console.log('🌱 Seeding additional carols (idempotent)...');

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
    for (const c of MORE_CAROLS) {
      // Skip if a carol with same title+artist exists
      const existing = await db.select({ id: carols.id }).from(carols)
        .where(and(eq(carols.title, c.title), eq(carols.artist, c.artist)));
      if (existing.length > 0) {
        console.log(`↩️  Skipped (exists): ${c.title} — ${c.artist}`);
        continue;
      }

      await db.insert(carols).values({
        id: randomUUID(),
        title: c.title,
        artist: c.artist,
        duration: c.duration,
        energy: c.energy,
        tags: c.tags,
        lyrics: [],
        votes: 0,
      });
      console.log(`✅ Added: ${c.title}`);
    }
    console.log('✨ Additional seeding complete!');
  } catch (err) {
    console.error('❌ Seeding more carols failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
