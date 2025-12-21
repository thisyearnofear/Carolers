import 'server-only';
import { getDb } from './db';
import { carols, type Carol } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

export async function getCarols(lang: string = 'en'): Promise<Carol[]> {
  try {
    const db = await getDb();
    if (lang) {
      // Filter by language when provided (default 'en')
      // @ts-ignore - language is added in our schema
      return await db.select().from(carols).where(eq((carols as any).language, lang));
    }
    return await db.select().from(carols);
  } catch (error) {
    console.error('Failed to fetch carols:', error);
    return [];
  }
}

export async function getCarol(id: string): Promise<Carol | null> {
  try {
    const db = await getDb();
    const result = await db.select().from(carols).where(eq(carols.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error(`Failed to fetch carol with id ${id}:`, error);
    return null;
  }
}

export async function voteForCarol(id: string) {
  try {
    const db = await getDb();
    await db.update(carols).set({
      votes: sql`${carols.votes} + 1`
    }).where(eq(carols.id, id));
  } catch (error) {
    console.error(`Failed to vote for carol with id ${id}:`, error);
    throw error;
  }
}

export async function searchCarols(query: string, limit: number = 5): Promise<any[]> {
  try {
    const db = await getDb();
    
    // Search by title or artist
    const results = await db
      .select({
        id: carols.id,
        title: carols.title,
        artist: carols.artist,
        duration: carols.duration,
        energy: carols.energy,
        coverUrl: carols.coverUrl,
      })
      .from(carols)
      .where(
        sql`${carols.title} LIKE ${`%${query}%`} OR ${carols.artist} LIKE ${`%${query}%`}`
      )
      .limit(limit);
    
    return results;
  } catch (error) {
    console.error('Failed to search carols:', error);
    return [];
  }
}

export async function getPopularCarols(limit: number = 10): Promise<any[]> {
  try {
    const db = await getDb();
    const results = await db
      .select({
        id: carols.id,
        title: carols.title,
        artist: carols.artist,
        votes: carols.votes,
      })
      .from(carols)
      .orderBy(carols.votes)
      .limit(limit);
    
    return results;
  } catch (error) {
    console.error('Failed to get popular carols:', error);
    return [];
  }
}
