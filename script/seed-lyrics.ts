
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
  // Look for links inside the "Quilt" or "gridmenu" macro equivalent in HTML
  // Based on head -n 100 output: {<a href="twofrontteeth.html"><span class="notespelling">A</span>ll...</a>}
  // And the generated HTML has <a href="twofrontteeth.html">...</a>
  // We'll just look for href=".html" that aren't index.html or carols.html
  
  const regex = /href=\"([^\\\"]+\.html)\"/g;
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
  // Extract Title
  const titleMatch = html.match(/<h1>(.*?)<\/h1>/);
  if (!titleMatch) return null;
  
  let title = titleMatch[1];
  // Remove <img> tags and &nbsp;
  title = title.replace(/<img[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  
  // Extract Artist/Author from meta
  const authorMatch = html.match(/<meta name=\"Author\" content=\"(.*?)\">/);
  let artist = authorMatch ? authorMatch[1] : 'Traditional';
  if (artist.toLowerCase().includes('public domain')) {
    artist = 'Traditional';
  }

  // Extract Lyrics
  // Look for the first <p> that contains <br> or comes after h1
  // We'll search for <p>.*?</p>
  
  // Simple regex to find paragraphs
  const pRegex = /<p>(.*?)<\/p>/gs;
  let lyrics: string[] = [];
  
  let pMatch;
  while ((pMatch = pRegex.exec(html)) !== null) {
    const content = pMatch[1];
    // Check if this looks like lyrics (has <br> or multiple lines)
    if (content.includes('<br>') || content.split('\n').length > 2) {
      // Split by <br> or <br/>
      lyrics = content
        .split(/<br\s*\/?>/i)
        .map(line => line.replace(/<[^>]+>/g, '').trim()) // Remove other tags
        .filter(line => line.length > 0);
      
      if (lyrics.length > 0) break; // Found the lyrics
    }
  }
  
  if (lyrics.length === 0) return null;

  return { title, lyrics, artist };
}

async function seedLyrics() {
  console.log('🌱 Starting lyrics seed...');
  
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
        // console.log(`Processing ${link}...`);
        const html = await fetchHtml(url);
        const data = parseCarolPage(html);
        
        if (data) {
           await db.insert(carols).values({
            title: data.title,
            artist: data.artist,
            lyrics: data.lyrics,
            duration: '3:00', // Default duration
            energy: 'medium', // Default energy
            tags: ['traditional', 'christmas'],
          });
          processed++;
          process.stdout.write('.'); // Progress indicator
        } else {
          console.warn(`\nCould not parse data for ${link}`);
        }
        
        // Be nice to the server
        await new Promise(resolve => setTimeout(resolve, 100)); 
        
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
