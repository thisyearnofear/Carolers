import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { carols } from '../shared/schema';
import { randomUUID } from 'crypto';
import { eq, and } from 'drizzle-orm';

// Additional carols set across regions/languages; lyrics omitted.
// Focus is on metadata so the songbook is populated and filterable.
const EVEN_MORE_CAROLS: Array<{
  title: string;
  artist: string;
  duration: string;
  energy: 'low' | 'medium' | 'high';
  tags: string[];
}> = [
  { title: 'Il est né, le divin Enfant', artist: 'Traditional (French)', duration: '2:30', energy: 'medium', tags: ['French','Classic'] },
  { title: 'Un flambeau, Jeannette, Isabelle', artist: 'Traditional (French)', duration: '2:00', energy: 'medium', tags: ['French','Folk'] },
  { title: 'Entre le boeuf et l’âne gris', artist: 'Traditional (French)', duration: '2:20', energy: 'low', tags: ['French','Lullaby'] },
  { title: 'Minuit, chrétiens (O Holy Night)', artist: 'Adolphe Adam', duration: '4:10', energy: 'medium', tags: ['French','Solo'] },
  { title: 'Stille Nacht (Silent Night)', artist: 'Traditional (German)', duration: '3:10', energy: 'low', tags: ['German','Classic'] },
  { title: 'Leise rieselt der Schnee', artist: 'Traditional (German)', duration: '2:15', energy: 'low', tags: ['German','Calm'] },
  { title: 'O du fröhliche', artist: 'Traditional (German)', duration: '2:20', energy: 'medium', tags: ['German','Classic'] },
  { title: 'Es ist ein Ros entsprungen', artist: 'Traditional (German)', duration: '2:45', energy: 'low', tags: ['German','Chorale'] },
  { title: 'Fum, Fum, Fum', artist: 'Traditional (Catalan)', duration: '2:05', energy: 'high', tags: ['Spanish','Catalan','Upbeat'] },
  { title: 'Los peces en el río', artist: 'Traditional (Spanish)', duration: '2:45', energy: 'medium', tags: ['Spanish','Folk'] },
  { title: 'Campana sobre campana', artist: 'Traditional (Spanish)', duration: '2:30', energy: 'medium', tags: ['Spanish','Folk'] },
  { title: 'Noche de Paz (Silent Night)', artist: 'Traditional (Spanish)', duration: '3:10', energy: 'low', tags: ['Spanish','Classic'] },
  { title: 'Tu scendi dalle stelle', artist: 'Traditional (Italian)', duration: '2:30', energy: 'low', tags: ['Italian','Classic'] },
  { title: 'Astro del ciel (Silent Night)', artist: 'Traditional (Italian)', duration: '3:10', energy: 'low', tags: ['Italian','Classic'] },
  { title: 'Adeste Fideles (Latin)', artist: 'Traditional', duration: '3:10', energy: 'medium', tags: ['Latin','Classic'] },
  { title: 'Veni, Veni, Emmanuel (Latin)', artist: 'Traditional', duration: '3:20', energy: 'low', tags: ['Latin','Advent'] },
  { title: 'Gaudete (Latin)', artist: 'Traditional', duration: '2:15', energy: 'medium', tags: ['Latin','Renaissance'] },
  { title: 'Quem Pastores Laudavere', artist: 'Traditional (Latin)', duration: '2:40', energy: 'medium', tags: ['Latin','Chorale'] },
  { title: 'Deck the Halls (Welsh: Nos Galan)', artist: 'Traditional (Welsh)', duration: '2:20', energy: 'high', tags: ['Welsh','Upbeat'] },
  { title: 'Suo Gân (Lullaby)', artist: 'Traditional (Welsh)', duration: '2:50', energy: 'low', tags: ['Welsh','Lullaby'] },
  { title: 'A la nanita nana', artist: 'Traditional (Spanish)', duration: '2:35', energy: 'low', tags: ['Spanish','Lullaby'] },
  { title: 'Wiegenlied (Brahms’ Lullaby)', artist: 'Johannes Brahms', duration: '2:40', energy: 'low', tags: ['German','Lullaby'] },
  { title: 'O Come, Little Children', artist: 'Traditional', duration: '2:10', energy: 'low', tags: ['Children'] },
  { title: 'Cradle Song (Away in a Manger tune)', artist: 'William J. Kirkpatrick', duration: '2:20', energy: 'low', tags: ['Lullaby','Classic'] },
  { title: 'He Is Born, the Divine Christ Child', artist: 'Traditional (French)', duration: '2:30', energy: 'medium', tags: ['French','Classic'] },
  { title: 'Sussex Carol', artist: 'Traditional (English)', duration: '2:25', energy: 'medium', tags: ['English','Folk'] },
  { title: 'The Boar’s Head Carol', artist: 'Traditional (English)', duration: '2:10', energy: 'medium', tags: ['English','Feast'] },
  { title: 'I Wonder as I Wander', artist: 'John Jacob Niles', duration: '2:50', energy: 'low', tags: ['Appalachian','Solo'] },
  { title: 'Mary’s Boy Child', artist: 'Jester Hairston', duration: '3:10', energy: 'medium', tags: ['Caribbean','Gospel'] },
  { title: 'Maoz Tzur (Rock of Ages)', artist: 'Traditional (Hebrew)', duration: '2:30', energy: 'medium', tags: ['Hanukkah','Hebrew'] },
  { title: 'Hanerot Halalu', artist: 'Traditional (Hebrew)', duration: '2:10', energy: 'medium', tags: ['Hanukkah','Hebrew'] },
  { title: 'Mi Yimalel', artist: 'Traditional (Hebrew)', duration: '2:20', energy: 'medium', tags: ['Hanukkah','Hebrew'] },
  { title: 'Auld Lang Syne', artist: 'Robert Burns', duration: '2:45', energy: 'medium', tags: ['New Year','Tradition'] },
  { title: 'Twelve Days of Christmas', artist: 'Traditional (English)', duration: '4:20', energy: 'medium', tags: ['English','Cumulative'] },
  { title: 'Jolly Old Saint Nicholas', artist: 'Traditional (English)', duration: '2:00', energy: 'medium', tags: ['Children','Classic'] },
  { title: 'Up on the Housetop', artist: 'Benjamin Hanby', duration: '1:55', energy: 'high', tags: ['Children','Upbeat'] },
  { title: 'Ring, Christmas Bells', artist: 'Mykola Leontovych', duration: '1:30', energy: 'high', tags: ['Choir','Rhythmic'] },
  { title: 'On Christmas Night (Sussex Carol)', artist: 'Traditional (English)', duration: '2:20', energy: 'medium', tags: ['English','Folk'] },
  { title: 'Of the Father’s Love Begotten', artist: 'Prudentius', duration: '3:00', energy: 'low', tags: ['Latin','Chant'] },
  { title: 'Huron Carol (’Twas in the Moon of Wintertime)', artist: 'Jean de Brébeuf', duration: '2:50', energy: 'low', tags: ['Canadian','Indigenous'] },
  { title: 'Infant Holy, Infant Lowly', artist: 'Traditional (Polish)', duration: '2:10', energy: 'low', tags: ['Polish','Classic'] },
  { title: 'Bring a Torch, Jeanette, Isabella (English)', artist: 'Traditional (French)', duration: '2:00', energy: 'medium', tags: ['French','Folk'] },
  { title: 'Rise Up, Shepherd, and Follow', artist: 'Traditional (Spiritual)', duration: '2:20', energy: 'medium', tags: ['Spiritual'] },
  { title: 'Mary Had a Baby', artist: 'Traditional (Spiritual)', duration: '2:15', energy: 'medium', tags: ['Spiritual'] },
];

async function main() {
  console.log('🌱 Seeding even more carols (idempotent)...');

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
    for (const c of EVEN_MORE_CAROLS) {
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
    console.log('✨ Even more seeding complete!');
  } catch (err) {
    console.error('❌ Seeding even more carols failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
