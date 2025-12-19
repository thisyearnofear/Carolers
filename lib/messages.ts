import { db } from './db';
import { messages, type Message } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function getEventMessages(eventId: string): Promise<Message[]> {
  try {
    return await db.select().from(messages).where(eq(messages.eventId, eventId)).orderBy(messages.timestamp);
  } catch (error) {
    console.error(`Failed to fetch messages for event ${eventId}:`, error);
    return [];
  }
}

export async function addMessage(messageData: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
  try {
    const [newMessage] = await db.insert(messages).values(messageData).returning();
    return newMessage;
  } catch (error) {
    console.error('Failed to add message:', error);
    throw error;
  }
}