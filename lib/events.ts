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
        isPrivate: events.isPrivate,
        password: events.password,
        pinnedMessage: events.pinnedMessage,
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
        isPrivate: events.isPrivate,
        password: events.password,
        pinnedMessage: events.pinnedMessage,
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

type CreateEventInput = Pick<Event, 'name' | 'date' | 'theme' | 'venue' | 'description' | 'createdBy'> & Partial<Pick<Event, 'isPrivate' | 'password'>>;
export async function createEvent(eventData: CreateEventInput) {
  try {
    const db = await getDb();
    const id = crypto.randomUUID();
    await db.insert(events).values({
      ...eventData,
      id,
      isPrivate: eventData.isPrivate ?? 0,
      password: eventData.password ?? null,
      members: [],
      carols: [],
      coverImage: null,
    });
    // MySQL doesn't support returning, so return the input data
    return {
      ...eventData,
      isPrivate: eventData.isPrivate ?? 0,
      password: eventData.password ?? null,
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

export async function updateEvent(eventId: string, updates: Partial<Event>) {
  try {
    const db = await getDb();
    await db.update(events)
      .set(updates)
      .where(eq(events.id, eventId));
    return { success: true };
  } catch (error) {
    console.error('Failed to update event:', error);
    throw error;
  }
}

export async function addCarolToEvent(eventId: string, carolId: string) {
  try {
    const db = await getDb();
    const event = await getEvent(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    const currentCarols = event.carols || [];
    
    // Prevent duplicates
    if (currentCarols.includes(carolId)) {
      return { success: true, alreadyAdded: true };
    }
    
    // Add the carol
    const updatedCarols = [...currentCarols, carolId];
    
    await db.update(events)
      .set({ carols: updatedCarols })
      .where(eq(events.id, eventId));
    
    return { success: true, added: true };
  } catch (error) {
    console.error('Failed to add carol to event:', error);
    throw error;
  }
}

export async function removeCarolFromEvent(eventId: string, carolId: string) {
  try {
    const db = await getDb();
    const event = await getEvent(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    const currentCarols = event.carols || [];
    const updatedCarols = currentCarols.filter(id => id !== carolId);
    
    await db.update(events)
      .set({ carols: updatedCarols })
      .where(eq(events.id, eventId));
    
    return { success: true };
  } catch (error) {
    console.error('Failed to remove carol from event:', error);
    throw error;
  }
}
