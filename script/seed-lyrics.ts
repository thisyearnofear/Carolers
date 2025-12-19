import { db } from '../server/db';
import { carols } from '../shared/schema';
import { sql } from 'drizzle-orm';

const BASE_URL = 'https://www.mindprod.com/carol';
const INDEX_URL = `${BASE_URL}/carols.html`;

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function extractLinks(html: string): string[] {
  const regex = /href="([^\"]+\.html)"/g;
  const links = new Set<string>();
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    const link = match[1];
    if (link && !link.includes('index.html') && !link.includes('carols.html') && !link.startsWith('http') && !link.includes('../')) {
      links.add(link);
    }
  }
  
  return Array.from(links);
}

function parseCarolPage(html: string): { title: string; lyrics: string[]; artist: string } | null {
  // Extract Title from <h1> or <title>
  let title = '';
  const titleMatch = html.match(/<h1>(.*?)<\/h1>/s);
  if (titleMatch) {
    title = titleMatch[1].replace(/<img[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  } else {
    const metaTitleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (metaTitleMatch) title = metaTitleMatch[1].trim();
  }
  
  if (!title) return null;
  
  // Extract Artist/Author
  const authorMatch = html.match(/<meta\s+name="Author"\s+content="([^\"]+)"/i);
  let artist = authorMatch ? authorMatch[1] : 'Traditional';
  if (artist.toLowerCase().includes('public domain')) {
    artist = 'Traditional';
  }

  // Extract Lyrics
  // The lyrics are usually in a <p> tag that contains <br> tags.
  // We'll look for <p> tags and see if they contain <br>
  const pRegex = /<p>(.*?)<\/p>/gs;
  let lyrics: string[] = [];
  
  let pMatch;
  while ((pMatch = pRegex.exec(html)) !== null) {
    const content = pMatch[1];
    if (content.includes('<br>') || content.includes('<br/>') || content.includes('<br />')) {
      const lines = content
        .split(/<br\s*\/?>/i)
        .map(line => line.replace(/<[^>]+>/g, '').replace(/&rsquo;/g, "'").replace(/&nbsp;/g, ' ').trim())
        .filter(line => line.length > 0);
      
      if (lines.length > 2) {
        lyrics = lines;
        break;
      }
    }
  }
  
  if (lyrics.length === 0) return null;

  return { title, lyrics, artist };
}

async function seedLyrics() {
  console.log('🌱 Starting lyrics seed (TiDB)...');
  
  try {
    // Clear existing carols
    console.log('Cleaning up existing carols...');
    await db.delete(carols);
    
    console.log(`Fetching index from ${INDEX_URL}...`);
    const indexHtml = await fetchHtml(INDEX_URL);
    const links = extractLinks(indexHtml);
    
    console.log(`Found ${links.length} carol links.`);
    
    let processed = 0;
    
    for (const link of links) {
      const url = `${BASE_URL}/${link}`;
      try {
        const html = await fetchHtml(url);
        const data = parseCarolPage(html);
        
        if (data) {
           await db.insert(carols).values({
            title: data.title,
            artist: data.artist,
            lyrics: data.lyrics,
            duration: '3:00',
            energy: 'medium',
            tags: ['traditional', 'christmas'],
          });
          processed++;
          process.stdout.write('.');
        } else {
          // console.warn(`\nCould not parse data for ${link}`);
        }
        
        // Wait a bit between requests
        await new Promise(resolve => setTimeout(resolve, 50)); 
        
      } catch (err) {
        console.error(`\nError processing ${link}:`, err);
      }
    }
    
    console.log(`\n✨ Successfully seeded ${processed} carols!`);
    
  } catch (error) {
    console.error('Fatal error during seeding:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

seedLyrics();