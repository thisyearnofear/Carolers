// ENHANCEMENT FIRST: Extend existing storage interface instead of creating new
import { 
  type User, type Event, type Carol, type Contribution, type Message,
  type InsertUser, type InsertEvent, type InsertCarol, type InsertContribution, type InsertMessage
} from "@shared/schema";
import { randomUUID } from "crypto";

// CLEAN: Single interface for all storage operations
export interface IStorage {
  // User operations - ENHANCEMENT FIRST: Add upsert for Clerk integration
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: InsertUser): Promise<User>; // For Clerk user sync
  
  // Event operations - MODULAR: Domain-specific grouping
  getEvent(id: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  joinEvent(eventId: string, userId: string): Promise<void>;
  
  // Carol operations
  getCarol(id: string): Promise<Carol | undefined>;
  getAllCarols(): Promise<Carol[]>;
  createCarol(carol: InsertCarol): Promise<Carol>;
  voteForCarol(carolId: string): Promise<void>;
  
  // Contribution operations
  getEventContributions(eventId: string): Promise<Contribution[]>;
  createContribution(contribution: InsertContribution): Promise<Contribution>;
  updateContributionStatus(id: string, status: 'proposed' | 'confirmed' | 'brought'): Promise<void>;
  
  // Message operations
  getEventMessages(eventId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

// MODULAR: Clean implementation with domain separation
export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private events: Map<string, Event> = new Map();
  private carols: Map<string, Carol> = new Map();
  private contributions: Map<string, Contribution> = new Map();
  private messages: Map<string, Message> = new Map();

  constructor() {
    // PERFORMANT: Initialize with mock data for development
    this.initializeMockData();
  }

  // DRY: Generic helper for ID generation
  private generateId(): string {
    return randomUUID();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { ...insertUser, id: this.generateId() };
    this.users.set(user.id, user);
    return user;
  }

  // Event operations
  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const event: Event = {
      ...insertEvent,
      id: this.generateId(),
      members: [],
      carols: [],
      createdAt: new Date(),
    };
    this.events.set(event.id, event);
    return event;
  }

  async joinEvent(eventId: string, userId: string): Promise<void> {
    const event = this.events.get(eventId);
    if (event && !event.members.includes(userId)) {
      event.members.push(userId);
    }
  }

  // Carol operations
  async getCarol(id: string): Promise<Carol | undefined> {
    return this.carols.get(id);
  }

  async getAllCarols(): Promise<Carol[]> {
    return Array.from(this.carols.values());
  }

  async createCarol(insertCarol: InsertCarol): Promise<Carol> {
    const carol: Carol = { ...insertCarol, id: this.generateId(), votes: 0 };
    this.carols.set(carol.id, carol);
    return carol;
  }

  async voteForCarol(carolId: string): Promise<void> {
    const carol = this.carols.get(carolId);
    if (carol) {
      carol.votes = (carol.votes || 0) + 1;
    }
  }

  // Contribution operations
  async getEventContributions(eventId: string): Promise<Contribution[]> {
    return Array.from(this.contributions.values()).filter(c => c.eventId === eventId);
  }

  async createContribution(insertContribution: InsertContribution): Promise<Contribution> {
    const contribution: Contribution = {
      ...insertContribution,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.contributions.set(contribution.id, contribution);
    return contribution;
  }

  async updateContributionStatus(id: string, status: 'proposed' | 'confirmed' | 'brought'): Promise<void> {
    const contribution = this.contributions.get(id);
    if (contribution) {
      contribution.status = status;
    }
  }

  // Message operations
  async getEventMessages(eventId: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(m => m.eventId === eventId);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      ...insertMessage,
      id: this.generateId(),
      timestamp: new Date(),
    };
    this.messages.set(message.id, message);
    return message;
  }

  // PERFORMANT: Initialize with development data
  private initializeMockData(): void {
    // Mock carols
    const mockCarols: Carol[] = [
      {
        id: '1',
        title: 'Silent Night',
        artist: 'Traditional',
        tags: ['traditional', 'slow', 'peaceful'],
        duration: '3:15',
        energy: 'low',
        lyrics: ["Silent night, holy night!", "All is calm, all is bright."],
        votes: 8
      },
      {
        id: '2', 
        title: 'Jingle Bells',
        artist: 'James Lord Pierpont',
        tags: ['upbeat', 'kids', 'fun'],
        duration: '2:35',
        energy: 'high',
        lyrics: ["Dashing through the snow", "In a one-horse open sleigh"],
        votes: 12
      }
    ];

    mockCarols.forEach(carol => this.carols.set(carol.id, carol));

    // Mock event
    const mockEvent: Event = {
      id: 'event1',
      name: 'Christmas Carol Gathering 2024',
      date: new Date(2024, 11, 25),
      theme: 'Christmas',
      venue: 'Central Park Amphitheater',
      description: 'Join us for a festive caroling event!',
      members: ['user1'],
      carols: ['1', '2'],
      createdAt: new Date(),
    };

    this.events.set(mockEvent.id, mockEvent);
  }
}

export const storage = new MemStorage();
