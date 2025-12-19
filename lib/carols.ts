import { db } from './db';
import { carols, type Carol } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

export async function getCarols(): Promise<Carol[]> {
  try {
    return await db.select().from(carols);
  } catch (error) {
    console.error('Failed to fetch carols:', error);
    return [];
  }
}

export async function getCarol(id: string): Promise<Carol | null> {
  try {
    const result = await db.select().from(carols).where(eq(carols.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error(`Failed to fetch carol with id ${id}:`, error);
    return null;
  }
}

export async function voteForCarol(id: string) {
  try {
    await db.update(carols).set({
      votes: sql`${carols.votes} + 1`
    }).where(eq(carols.id, id));
  } catch (error) {
    console.error(`Failed to vote for carol with id ${id}:`, error);
    throw error;
  }
}
