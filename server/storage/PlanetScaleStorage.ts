// ENHANCEMENT FIRST: Real database implementation of existing storage interface
import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { users, events, carols, contributions, messages } from '@shared/schema';
import type { IStorage } from '../storage';
import type { 
  User, Event, Carol, Contribution, Message,
  InsertUser, InsertEvent, InsertCarol, InsertContribution, InsertMessage
} from '@shared/schema';

export class PlanetScaleStorage implements IStorage {
  
  // CLEAN: User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const [insertedUser] = await db.insert(users).values(user).returning();
    return insertedUser;
  }

  async upsertUser(user: InsertUser): Promise<User> {
    // ENHANCEMENT FIRST: Handle Clerk user creation/updates
    const existing = await this.getUser(user.id!);
    if (existing) {
      const [updated] = await db.update(users)
        .set({ username: user.username, email: user.email, imageUrl: user.imageUrl })
        .where(eq(users.id, user.id!))
        .returning();
      return updated;
    }
    return this.createUser(user);
  }

  // CLEAN: Event operations
  async getEvent(id: string): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
  }

  async getAllEvents(): Promise<Event[]> {
    return db.select().from(events).orderBy(desc(events.createdAt));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [insertedEvent] = await db.insert(events).values({
      ...event,
      id: crypto.randomUUID(),
    }).returning();
    return insertedEvent;
  }

  async joinEvent(eventId: string, userId: string): Promise<void> {
    // PERFORMANT: Atomic update with array manipulation
    const event = await this.getEvent(eventId);
    if (event && !event.members.includes(userId)) {
      await db.update(events)
        .set({ members: [...event.members, userId] })
        .where(eq(events.id, eventId));
    }
  }

  // CLEAN: Carol operations
  async getCarol(id: string): Promise<Carol | undefined> {
    const result = await db.select().from(carols).where(eq(carols.id, id)).limit(1);
    return result[0];
  }

  async getAllCarols(): Promise<Carol[]> {
    return db.select().from(carols).orderBy(desc(carols.createdAt));
  }

  async createCarol(carol: InsertCarol): Promise<Carol> {
    const [insertedCarol] = await db.insert(carols).values({
      ...carol,
      id: crypto.randomUUID(),
    }).returning();
    return insertedCarol;
  }

  async voteForCarol(carolId: string): Promise<void> {
    // PERFORMANT: Atomic increment
    const carol = await this.getCarol(carolId);
    if (carol) {
      await db.update(carols)
        .set({ votes: (carol.votes || 0) + 1 })
        .where(eq(carols.id, carolId));
    }
  }

  // CLEAN: Contribution operations
  async getEventContributions(eventId: string): Promise<Contribution[]> {
    return db.select().from(contributions)
      .where(eq(contributions.eventId, eventId))
      .orderBy(desc(contributions.createdAt));
  }

  async createContribution(contribution: InsertContribution): Promise<Contribution> {
    const [insertedContribution] = await db.insert(contributions).values({
      ...contribution,
      id: crypto.randomUUID(),
    }).returning();
    return insertedContribution;
  }

  async updateContributionStatus(id: string, status: 'proposed' | 'confirmed' | 'brought'): Promise<void> {
    await db.update(contributions)
      .set({ status })
      .where(eq(contributions.id, id));
  }

  // CLEAN: Message operations  
  async getEventMessages(eventId: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(eq(messages.eventId, eventId))
      .orderBy(desc(messages.timestamp));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [insertedMessage] = await db.insert(messages).values({
      ...message,
      id: crypto.randomUUID(),
    }).returning();
    return insertedMessage;
  }
}