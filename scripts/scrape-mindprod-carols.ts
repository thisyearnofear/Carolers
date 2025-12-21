import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { carols } from '../shared/schema';
import { randomUUID } from 'crypto';
import * as https from 'https';

interface CarolData {
  title: string;
  artist: string;
  lyrics: string[];
  duration?: string;
  energy: 'low' | 'medium' | 'high';
  tags: string[];
}

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', reject);
  });
}

async function scrapeCarols(): Promise<CarolData[]> {
  console.log('🔍 Fetching carol list from mindprod.com...');
  
  const baseUrl = 'https://www.mindprod.com/carol';
  const listUrl = `${baseUrl}/carols.html`;
  
  try {
    const html = await fetchUrl(listUrl);
    
    // Extract links to individual carols
    // Pattern: href="songname.html" (relative links in the carol directory)
    const linkRegex = /href="([a-z]+\.html)"/g;
    const carolLinks: Set<string> = new Set();
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      const link = match[1];
      // Filter out index and carols.html
      if (!link.includes('index') && link !== 'carols.html') {
        carolLinks.add(`${baseUrl}/${link}`);
      }
    }
    
    const uniqueLinks = Array.from(carolLinks);
    console.log(`📋 Found ${uniqueLinks.length} carol pages`);
    
    const carols: CarolData[] = [];
    
    for (let i = 0; i < uniqueLinks.length; i++) {
      const url = uniqueLinks[i];
      const filename = url.split('/').pop() || '';
      
      try {
        console.log(`⏳ Fetching (${i + 1}/${uniqueLinks.length}): ${filename}`);
        const content = await fetchUrl(url);
        
        const carol = parseCarolPage(content, filename);
        if (carol && carol.lyrics.length > 0) {
          carols.push(carol);
        }
      } catch (error) {
        console.warn(`⚠️  Failed to fetch ${filename}`);
      }
      
      // Be nice to the server - add small delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return carols;
  } catch (error) {
    console.error('❌ Failed to scrape carols:', error);
    return [];
  }
}

function parseCarolPage(html: string, filename: string): CarolData | null {
  // Extract title from <h1> or filename
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = h1Match ? h1Match[1].trim() : filename.replace('.html', '').replace(/-/g, ' ');
  
  // Extract lyrics - typically in <pre> tags or <p> tags
  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
  let lyricsText = '';
  
  if (preMatch) {
    lyricsText = preMatch[1];
  } else {
    // Fallback: extract from paragraphs
    const pMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
    if (pMatches) {
      lyricsText = pMatches.join('\n');
    }
  }
  
  if (!lyricsText.trim()) {
    return null;
  }
  
  // Clean HTML tags
  let cleaned = lyricsText
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
  
  // Split into lines and filter empty ones
  const lyrics = cleaned
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  if (lyrics.length === 0) {
    return null;
  }
  
  // Estimate energy based on title keywords
  let energy: 'low' | 'medium' | 'high' = 'medium';
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('silent') || lowerTitle.includes('holy') || lowerTitle.includes('O come')) {
    energy = 'low';
  } else if (lowerTitle.includes('jingle') || lowerTitle.includes('rockin') || lowerTitle.includes('rock')) {
    energy = 'high';
  }
  
  return {
    title,
    artist: 'Traditional',
    lyrics,
    duration: '2:30',
    energy,
    tags: ['Christmas', 'Traditional'],
  };
}

async function seed() {
  console.log('🌱 Seeding carols from mindprod.com...\n');
  
  // Parse DATABASE_URL
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
    // Scrape carols from mindprod
    const scrapedCarols = await scrapeCarols();
    
    if (scrapedCarols.length === 0) {
      console.error('❌ No carols scraped');
      process.exit(1);
    }
    
    console.log(`\n✨ Successfully scraped ${scrapedCarols.length} carols\n`);
    console.log('📝 Now seeding to database...\n');
    
    // Clear existing carols (optional - comment out if you want to preserve)
    // await db.delete(carols);
    
    for (const carol of scrapedCarols) {
      try {
        await db.insert(carols).values({
          id: randomUUID(),
          title: carol.title,
          artist: carol.artist,
          lyrics: carol.lyrics,
          duration: carol.duration || '2:30',
          energy: carol.energy,
          tags: carol.tags,
        });
        console.log(`✅ ${carol.title} (${carol.lyrics.length} lines)`);
      } catch (error: any) {
        // Skip duplicates
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⏭️  ${carol.title} (already exists)`);
        } else {
          console.error(`❌ ${carol.title}:`, error.message);
        }
      }
    }
    
    console.log('\n✨ Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
