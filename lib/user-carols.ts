import 'server-only';
import { getDb } from './db';
import { userCarols, type UserCarol, type InsertUserCarol } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

export async function createUserCarol(data: InsertUserCarol): Promise<UserCarol> {
  try {
    const db = await getDb();
    const carolId = crypto.randomUUID();
    
    const fullData = {
      ...data,
      id: carolId,
      status: data.status as 'processing' | 'complete' | 'error' || 'processing',
    };

    await db.insert(userCarols).values(fullData);
    
    // Return the created record
    const created = await db.select().from(userCarols).where(eq(userCarols.id, carolId)).limit(1);
    return created[0]!;
  } catch (error) {
    console.error('Failed to create user carol:', error);
    throw error;
  }
}

export async function getUserCarolByJobId(jobId: string): Promise<UserCarol | null> {
  try {
    const db = await getDb();
    const result = await db.select().from(userCarols).where(eq(userCarols.sunoJobId, jobId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Failed to fetch user carol by job ID:', error);
    throw error;
  }
}

export async function getUserCarol(id: string): Promise<UserCarol | null> {
  try {
    const db = await getDb();
    const result = await db.select().from(userCarols).where(eq(userCarols.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Failed to fetch user carol:', error);
    throw error;
  }
}

export async function updateUserCarolStatus(
  id: string,
  status: 'processing' | 'complete' | 'error',
  updates?: {
    audioUrl?: string;
    videoUrl?: string;
    imageUrl?: string;
    errorMessage?: string;
  }
): Promise<void> {
  try {
    const db = await getDb();
    const data: any = { status };
    
    if (status === 'complete') {
      data.completedAt = new Date();
      if (updates?.audioUrl) data.audioUrl = updates.audioUrl;
      if (updates?.videoUrl) data.videoUrl = updates.videoUrl;
      if (updates?.imageUrl) data.imageUrl = updates.imageUrl;
    } else if (status === 'error') {
      data.errorMessage = updates?.errorMessage || null;
    }

    await db.update(userCarols).set(data).where(eq(userCarols.id, id));
  } catch (error) {
    console.error('Failed to update user carol status:', error);
    throw error;
  }
}

export async function getUserCarols(
  userId: string,
  filters?: { status?: 'processing' | 'complete' | 'error' }
): Promise<UserCarol[]> {
  try {
    const db = await getDb();
    let query = db.select().from(userCarols).where(eq(userCarols.createdBy, userId));
    
    if (filters?.status) {
      // @ts-ignore
      query = query.where(eq(userCarols.status, filters.status));
    }

    const results = await query.orderBy(sql`${userCarols.createdAt} DESC`);
    return results;
  } catch (error) {
    console.error('Failed to fetch user carols:', error);
    return [];
  }
}

export async function getUserCarolsProcessing(): Promise<UserCarol[]> {
  try {
    const db = await getDb();
    const results = await db.select().from(userCarols).where(eq(userCarols.status, 'processing'));
    return results;
  } catch (error) {
    console.error('Failed to fetch processing carols:', error);
    return [];
  }
}

export async function incrementUserCarolPlays(id: string): Promise<void> {
  try {
    const db = await getDb();
    await db.update(userCarols).set({
      plays: sql`${userCarols.plays} + 1`
    }).where(eq(userCarols.id, id));
  } catch (error) {
    console.error('Failed to increment plays:', error);
    throw error;
  }
}

export async function incrementUserCarolLikes(id: string): Promise<void> {
  try {
    const db = await getDb();
    await db.update(userCarols).set({
      likes: sql`${userCarols.likes} + 1`
    }).where(eq(userCarols.id, id));
  } catch (error) {
    console.error('Failed to increment likes:', error);
    throw error;
  }
}

export async function getPopularUserCarols(limit: number = 10): Promise<UserCarol[]> {
  try {
    const db = await getDb();
    const results = await db
      .select()
      .from(userCarols)
      .where(eq(userCarols.status, 'complete'))
      .orderBy(sql`${userCarols.likes} DESC`)
      .limit(limit);
    return results;
  } catch (error) {
    console.error('Failed to fetch popular user carols:', error);
    return [];
  }
}
