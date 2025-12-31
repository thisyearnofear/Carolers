import 'server-only';
import { getDb } from './db';
import { messages, type Message } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function getEventMessages(eventId: string): Promise<Message[]> {
  try {
    const db = await getDb();
    return await db.select().from(messages).where(eq(messages.eventId, eventId)).orderBy(messages.timestamp);
  } catch (error) {
    console.error(`Failed to fetch messages for event ${eventId}:`, error);
    return [];
  }
}

export async function addMessage(messageData: Omit<Message, 'id' | 'timestamp'>): Promise<Partial<Message>> {
  try {
    const db = await getDb();
    // Ensure type and payload are properly handled
    const messageToInsert = {
      ...messageData,
      type: messageData.type || 'text',
      payload: messageData.payload || null,
    };
    await db.insert(messages).values(messageToInsert);
    // MySQL doesn't support returning, so return the input data
    return {
      ...messageToInsert,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Failed to add message:', error);
    throw error;
  }
}
