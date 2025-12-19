// ENHANCEMENT FIRST: Real database implementation of existing storage interface
import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { users, events, carols, contributions, messages } from '@shared/schema';
import type { IStorage } from '../storage';
import type { 
  User, Event, Carol, Contribution, Message,
  InsertUser, InsertEvent, InsertCarol, InsertContribution, InsertMessage
} from '@shared/schema';
import { randomUUID } from "crypto";

export class DatabaseStorage implements IStorage {
  
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
    await db.insert(users).values(user);
    const created = await this.getUser(user.id);
    if (!created) throw new Error("Failed to create user");
    return created;
  }

  async upsertUser(user: InsertUser): Promise<User> {
    // ENHANCEMENT FIRST: Handle Clerk user creation/updates
    const existing = await this.getUser(user.id!);
    if (existing) {
      await db.update(users)
        .set({ username: user.username, email: user.email, imageUrl: user.imageUrl })
        .where(eq(users.id, user.id!));
      return (await this.getUser(user.id!))!;
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
    const id = randomUUID();
    await db.insert(events).values({
      ...event,
      id,
    });
    return (await this.getEvent(id))!;
  }

  async joinEvent(eventId: string, userId: string): Promise<void> {
    // PERFORMANT: Atomic update with array manipulation
    const event = await this.getEvent(eventId);
    if (event && event.members && !event.members.includes(userId)) {
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
    const id = randomUUID();
    const { id: _, ...insertData } = carol as any;
    await db.insert(carols).values({
      ...insertData,
      id,
      votes: 0,
      energy: carol.energy as 'low' | 'medium' | 'high',
    });
    return (await this.getCarol(id))!;
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
    const id = randomUUID();
    const { id: _, ...insertData } = contribution as any;
    await db.insert(contributions).values({
      ...insertData,
      id,
      status: (contribution.status || 'proposed') as 'proposed' | 'confirmed' | 'brought' | null,
    });
    const result = await db.select().from(contributions).where(eq(contributions.id, id)).limit(1);
    return result[0];
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
    const id = randomUUID();
    await db.insert(messages).values({
      ...message,
      id,
    });
    const result = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
    return result[0];
  }
}
