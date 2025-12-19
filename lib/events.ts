import { db } from './db';
import { events, type Event } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function getEvents(): Promise<Event[]> {
  try {
    return await db.select().from(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return [];
  }
}

export async function getEvent(id: string): Promise<Event | null> {
  try {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error(`Failed to fetch event with id ${id}:`, error);
    return null;
  }
}

export async function createEvent(eventData: Omit<Event, 'id' | 'members' | 'carols' | 'createdAt'>) {
  try {
    const [newEvent] = await db.insert(events).values({
      ...eventData,
      members: [],
      carols: [],
    }).returning();
    return newEvent;
  } catch (error) {
    console.error('Failed to create event:', error);
    throw error;
  }
}