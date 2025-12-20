import 'server-only';
import { getDb } from './db';
import { events, type Event } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function getEvents(): Promise<Event[]> {
  try {
    const db = await getDb();
    return await db.select().from(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return [];
  }
}

export async function getEvent(id: string): Promise<Event | null> {
  try {
    const db = await getDb();
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error(`Failed to fetch event with id ${id}:`, error);
    return null;
  }
}

export async function createEvent(eventData: Omit<Event, 'id' | 'members' | 'carols' | 'createdAt' | 'coverImage'>) {
  try {
    const db = await getDb();
    await db.insert(events).values({
      ...eventData,
      members: [],
      carols: [],
      coverImage: null,
    });
    // MySQL doesn't support returning, so return the input data
    return {
      ...eventData,
      members: [],
      carols: [],
      coverImage: null,
    };
  } catch (error) {
    console.error('Failed to create event:', error);
    throw error;
  }
}
