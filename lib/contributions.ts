import 'server-only';
import { getDb } from './db';
import { contributions, type Contribution } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export async function getEventContributions(eventId: string): Promise<Contribution[]> {
  try {
    const db = await getDb();
    return await db.select().from(contributions).where(eq(contributions.eventId, eventId));
  } catch (error) {
    console.error(`Failed to fetch contributions for event ${eventId}:`, error);
    return [];
  }
}

export async function addContribution(contributionData: Omit<Contribution, 'id' | 'createdAt'>): Promise<Partial<Contribution>> {
  try {
    const db = await getDb();
    await db.insert(contributions).values(contributionData);
    // MySQL doesn't support returning, so return the input data
    return contributionData;
  } catch (error) {
    console.error('Failed to add contribution:', error);
    throw error;
  }
}
