import 'server-only';
import { getDb } from './db';
import { events, users, type Event } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function getEvents(): Promise<(Event & { creatorName: string | null })[]> {
  try {
    const db = await getDb();
    const result = await db
      .select({
        id: events.id,
        name: events.name,
        date: events.date,
        theme: events.theme,
        venue: events.venue,
        description: events.description,
        members: events.members,
        carols: events.carols,
        coverImage: events.coverImage,
        createdBy: events.createdBy,
        createdAt: events.createdAt,
        creatorName: users.username,
      })
      .from(events)
      .leftJoin(users, eq(events.createdBy, users.id));
    return result;
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return [];
  }
}

export async function getEvent(id: string): Promise<(Event & { creatorName: string | null }) | null> {
  try {
    const db = await getDb();
    const result = await db
      .select({
        id: events.id,
        name: events.name,
        date: events.date,
        theme: events.theme,
        venue: events.venue,
        description: events.description,
        members: events.members,
        carols: events.carols,
        coverImage: events.coverImage,
        createdBy: events.createdBy,
        createdAt: events.createdAt,
        creatorName: users.username,
      })
      .from(events)
      .leftJoin(users, eq(events.createdBy, users.id))
      .where(eq(events.id, id))
      .limit(1);
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

export async function joinEvent(eventId: string, userId: string) {
  try {
    const db = await getDb();
    const event = await getEvent(eventId);
    if (!event) throw new Error('Event not found');

    const members = event.members || [];
    if (!members.includes(userId)) {
      members.push(userId);
      await db.update(events)
        .set({ members })
        .where(eq(events.id, eventId));
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to join event:', error);
    throw error;
  }
}
