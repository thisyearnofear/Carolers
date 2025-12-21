import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { carols } from '../shared/schema';
import { randomUUID } from 'crypto';

const CAROLS_DATA = [
    {
        title: "Jingle Bells",
        artist: "Traditional",
        duration: "2:30",
        energy: "high",
        tags: ["Classic", "High Energy"],
        lyrics: [
            "[Verse 1]",
            "Dashing through the snow",
            "In a one-horse open sleigh",
            "O'er the fields we go",
            "Laughing all the way",
            "Bells on bobtails ring",
            "Making spirits bright",
            "What fun it is to ride and sing",
            "A caroling song tonight!",
            "",
            "[Chorus]",
            "Jingle bells, jingle bells",
            "Jingle all the way",
            "Oh, what fun it is to ride",
            "In a one-horse open sleigh, hey!",
            "Jingle bells, jingle bells",
            "Jingle all the way",
            "Oh, what fun it is to ride",
            "In a one-horse open sleigh",
            "",
            "[Verse 2]",
            "A day or two ago",
            "I thought I'd take a ride",
            "And soon, Miss Fanny Bright",
            "Was seated by my side",
            "The horse was lean and lank",
            "Misfortune seemed his lot",
            "He got into a drifted bank",
            "And then we got upsot"
        ]
    },
    {
        title: "Silent Night",
        artist: "Traditional",
        duration: "3:15",
        energy: "low",
        tags: ["Solemn", "Traditional"],
        lyrics: [
            "[Verse 1]",
            "Silent night, holy night",
            "All is calm, all is bright",
            "Round yon Virgin Mother and Child",
            "Holy Infant so tender and mild",
            "Sleep in heavenly peace",
            "Sleep in heavenly peace",
            "",
            "[Verse 2]",
            "Silent night, holy night",
            "Shepherds quake at the sight",
            "Glories stream from heaven afar",
            "Heavenly hosts sing Alleluia!",
            "Christ, the Savior is born",
            "Christ, the Savior is born",
            "",
            "[Verse 3]",
            "Silent night, holy night",
            "Son of God, love's pure light",
            "Radiant beams from Thy holy face",
            "With the dawn of redeeming grace",
            "Jesus, Lord, at Thy birth",
            "Jesus, Lord, at Thy birth"
        ]
    },
    {
        title: "Deck the Halls",
        artist: "Traditional",
        duration: "2:05",
        energy: "medium",
        tags: ["Classic", "Lively"],
        lyrics: [
            "[Verse 1]",
            "Deck the halls with boughs of holly",
            "Fa, la, la, la, la, la, la, la, la!",
            "'Tis the season to be jolly",
            "Fa, la, la, la, la, la, la, la, la!",
            "Don we now our gay apparel",
            "Fa, la, la, la, la, la, la, la!",
            "Troll the ancient Yuletide carol",
            "Fa, la, la, la, la, la, la, la, la!",
            "",
            "[Verse 2]",
            "See the blazing yule before us",
            "Fa, la, la, la, la, la, la, la, la!",
            "Strike the harp and join the chorus",
            "Fa, la, la, la, la, la, la, la, la!",
            "Follow me in merry measure",
            "Fa, la, la, la, la, la, la, la!",
            "While I tell of Yuletide treasure",
            "Fa, la, la, la, la, la, la, la, la!"
        ]
    }
];

async function seed() {
  console.log('🌱 Seeding carols...');

  // Parse DATABASE_URL like lib/db does
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
    for (const carol of CAROLS_DATA) {
      await db.insert(carols).values({
        id: randomUUID(),
        title: carol.title,
        artist: carol.artist,
        duration: carol.duration,
        energy: carol.energy as 'low' | 'medium' | 'high',
        tags: carol.tags,
        lyrics: carol.lyrics,
        votes: 0,
      });
      console.log(`✅ Added: ${carol.title}`);
    }
    console.log('✨ Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
