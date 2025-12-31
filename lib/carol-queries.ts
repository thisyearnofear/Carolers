import 'server-only';
import { getDb } from './db';
import { userCarols, carols } from '@shared/schema';
import { desc, sql } from 'drizzle-orm';

/**
 * Trending user carols sorted by likes (social proof)
 * Reusable query function - single source of truth
 */
export async function getTrendingUserCarols(limit: number = 5) {
  try {
    const db = await getDb();
    return await db
      .select({
        id: userCarols.id,
        title: userCarols.title,
        createdBy: userCarols.createdBy,
        status: userCarols.status,
        imageUrl: userCarols.imageUrl,
        audioUrl: userCarols.audioUrl,
        genre: userCarols.genre,
        likes: userCarols.likes,
        plays: userCarols.plays,
        createdAt: userCarols.createdAt,
      })
      .from(userCarols)
      .where(sql`${userCarols.status} = 'complete'`)
      .orderBy(desc(userCarols.likes), desc(userCarols.plays))
      .limit(limit);
  } catch (error) {
    console.error('Failed to fetch trending carols:', error);
    return [];
  }
}

/**
 * New/recent user carols
 */
export async function getNewUserCarols(limit: number = 10) {
  try {
    const db = await getDb();
    return await db
      .select({
        id: userCarols.id,
        title: userCarols.title,
        createdBy: userCarols.createdBy,
        status: userCarols.status,
        imageUrl: userCarols.imageUrl,
        audioUrl: userCarols.audioUrl,
        genre: userCarols.genre,
        likes: userCarols.likes,
        plays: userCarols.plays,
        createdAt: userCarols.createdAt,
      })
      .from(userCarols)
      .where(sql`${userCarols.status} = 'complete'`)
      .orderBy(desc(userCarols.createdAt))
      .limit(limit);
  } catch (error) {
    console.error('Failed to fetch new carols:', error);
    return [];
  }
}

/**
 * All completed user carols (for browsing)
 */
export async function getAllUserCarols(limit: number = 20) {
  try {
    const db = await getDb();
    return await db
      .select({
        id: userCarols.id,
        title: userCarols.title,
        createdBy: userCarols.createdBy,
        status: userCarols.status,
        imageUrl: userCarols.imageUrl,
        audioUrl: userCarols.audioUrl,
        genre: userCarols.genre,
        likes: userCarols.likes,
        plays: userCarols.plays,
        createdAt: userCarols.createdAt,
      })
      .from(userCarols)
      .where(sql`${userCarols.status} = 'complete'`)
      .orderBy(desc(userCarols.createdAt))
      .limit(limit);
  } catch (error) {
    console.error('Failed to fetch user carols:', error);
    return [];
  }
}
