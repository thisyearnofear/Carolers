import { db } from './db';
import { contributions, type Contribution } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export async function getEventContributions(eventId: string): Promise<Contribution[]> {
  try {
    return await db.select().from(contributions).where(eq(contributions.eventId, eventId));
  } catch (error) {
    console.error(`Failed to fetch contributions for event ${eventId}:`, error);
    return [];
  }
}

export async function addContribution(contributionData: Omit<Contribution, 'id' | 'createdAt'>): Promise<Contribution> {
  try {
    const [newContribution] = await db.insert(contributions).values(contributionData).returning();
    return newContribution;
  } catch (error) {
    console.error('Failed to add contribution:', error);
    throw error;
  }
}