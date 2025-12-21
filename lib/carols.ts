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
