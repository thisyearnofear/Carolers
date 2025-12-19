// ENHANCEMENT FIRST: Extend existing storage interface instead of creating new
import { 
  type User, type Event, type Carol, type Contribution, type Message,
  type InsertUser, type InsertEvent, type InsertCarol, type InsertContribution, type InsertMessage
} from "@shared/schema";
import { DatabaseStorage } from "./storage/DatabaseStorage";

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

// CLEAN: Enforce database-backed storage for serverless (Vercel)
// MODULAR: Memory storage is not suitable for stateless/serverless environments
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required. Memory-based storage is not supported in serverless environments.');
}

// PERFORMANT: Single instance of DatabaseStorage
export const storage = new DatabaseStorage();
