import 'server-only';
import { getDb } from './db';
import { carols, type Carol } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

export interface CarolFilters {
  lang?: string;
  query?: string;
  mood?: string;
  energy?: string;
}

export async function getCarols(filters: CarolFilters = {}): Promise<Carol[]> {
  const { lang = 'en', query, mood, energy } = filters;
  try {
    const db = await getDb();
    let conditions = [eq((carols as any).language, lang)];

    if (energy) {
      conditions.push(eq(carols.energy, energy as any));
    }

    if (mood) {
      const m = mood.toLowerCase();
      if (m === 'upbeat') conditions.push(eq(carols.energy, 'high'));
      else if (m === 'relaxing') conditions.push(eq(carols.energy, 'low'));
      else if (m === 'traditional') {
        conditions.push(sql`${carols.tags} LIKE '%Traditional%' OR ${carols.artist} LIKE '%Traditional%'`);
      } else if (m === 'religious') {
        conditions.push(sql`${carols.tags} LIKE '%Religious%' OR ${carols.tags} LIKE '%Christian%' OR ${carols.tags} LIKE '%Hymn%'`);
      }
    }

    if (query) {
      conditions.push(sql`(${carols.title} LIKE ${`%${query}%`} OR ${carols.artist} LIKE ${`%${query}%`} OR ${carols.tags} LIKE ${`%${query}%` || ''})`);
    }

    const queryBuilder = db.select().from(carols);
    if (conditions.length > 0) {
      // @ts-ignore
      queryBuilder.where(sql`${sql.join(conditions, sql` AND `)}`);
    }

    // Sort: carols with full lyrics (lyrics not empty) first, then by title
    return await queryBuilder.orderBy(sql`CASE WHEN JSON_LENGTH(${carols.lyrics}) > 0 THEN 0 ELSE 1 END`, carols.title);
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
