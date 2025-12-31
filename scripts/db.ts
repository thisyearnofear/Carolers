import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { carols } from '../shared/schema';
import { eq, sql, or } from 'drizzle-orm';

async function getDb() {
    const urlStr = (process.env.DATABASE_URL || '').split('?')[0];
    if (!urlStr) throw new Error('DATABASE_URL not set');
    const url = new URL(urlStr);
    const pool = mysql.createPool({
        host: url.hostname,
        port: parseInt(url.port || '3306'),
        user: url.username,
        password: decodeURIComponent(url.password),
        database: url.pathname.slice(1),
        ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
        connectionLimit: 1
    });
    return { db: drizzle({ client: pool, schema: { carols }, mode: 'default' }), pool };
}

async function inspect() {
    const { db, pool } = await getDb();
    try {
        const allCarols = await db.select().from(carols);
        console.log(`📊 Songbook Stats:`);
        console.log(`- Total Carols: ${allCarols.length}`);

        const slugs = allCarols.filter(c => !c.title.includes(' '));
        console.log(`- Potential Slugs: ${slugs.length}`);

        const emptyLyrics = allCarols.filter(c => !c.lyrics || c.lyrics.length === 0);
        console.log(`- Missing Lyrics: ${emptyLyrics.length}`);

        const htmlEntities = allCarols.filter(c => JSON.stringify(c.lyrics).includes('&'));
        console.log(`- Lyrics with HTML entities: ${htmlEntities.length}`);

        const shortLyrics = allCarols.filter(c => c.lyrics && c.lyrics.length > 0 && c.lyrics.length < 5);
        console.log(`- Short lyrics fragments (< 5 lines): ${shortLyrics.length}`);

        console.log('\nTop 10 Carols by Votes:');
        allCarols.sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 10).forEach((c, i) => {
            console.log(`${i + 1}. ${c.title} — ${c.artist} (${c.votes} votes)`);
        });

    } finally {
        await pool.end();
    }
}

async function fixCarols() {
    console.log('✨ Use "polish" command for AI-based fixes.');
}

async function polish() {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const aiKey = process.env.GEMINI_API_KEY;
    if (!aiKey || aiKey === 'your-gemini-api-key-here') {
        console.error('❌ GEMINI_API_KEY not set or invalid.');
        return;
    }

    const genAI = new GoogleGenerativeAI(aiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash' });
    const { db, pool } = await getDb();

    try {
        // Target: Slugs OR HTML entities OR short fragments
        const targetCarols = await db.select().from(carols).where(
            or(
                sql`${carols.title} NOT LIKE '% %'`,
                sql`${carols.lyrics} LIKE '%&%'`,
                sql`JSON_LENGTH(${carols.lyrics}) < 5`
            )
        );

        console.log(`🔍 Found ${targetCarols.length} carols to polish.`);

        for (const carol of targetCarols) {
            console.log(`Processing: ${carol.title}...`);
            try {
                const prompt = `
                  Polishing Christmas Carol: "${carol.title}" by "${carol.artist}"
                  1. Canonical Title. 2. Full Standard Lyrics array. 3. Clean HTML.
                  Respond ONLY JSON: { "title": string, "lyrics": string[] }
                `;

                const result = await model.generateContent(prompt);
                const text = result.response.text();
                const data = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);

                await db.update(carols).set({ title: data.title, lyrics: data.lyrics }).where(eq(carols.id, carol.id));
                console.log(`✅ Polished: ${data.title}`);
                await new Promise(r => setTimeout(r, 500));
            } catch (err) {
                console.error(`❌ Failed ${carol.title}:`, err);
            }
        }
    } finally {
        await pool.end();
    }
}

const cmd = process.argv[2];
if (cmd === 'inspect') inspect();
else if (cmd === 'fix') fixCarols();
else if (cmd === 'polish') polish();
else console.log('Usage: ts-node scripts/db.ts [inspect|fix|polish]');
