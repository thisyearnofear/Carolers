import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, timestamp, json, datetime, int } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ENHANCEMENT FIRST: Adapt existing schema for PlanetScale/TiDB MySQL
// Users table - now uses Clerk user IDs as primary keys
export const users = mysqlTable("users", {
  id: varchar("id", { length: 191 }).primaryKey(), // Clerk user ID
  username: text("username").notNull(),
  email: text("email"),
  imageUrl: text("image_url"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Events table - consolidate from client store
export const events = mysqlTable("events", {
  id: varchar("id", { length: 191 }).primaryKey(),
  name: text("name").notNull(),
  date: datetime("date").notNull(),
  theme: text("theme").notNull(),
  venue: text("venue"),
  description: text("description").notNull(),
  members: json("members").$type<string[]>(),
  carols: json("carols").$type<string[]>(),
  coverImage: text("cover_image"),
  isPrivate: int("is_private").default(0), // 0 for false, 1 for true
  password: text("password"),
  createdBy: varchar("created_by", { length: 191 }).notNull().references(() => users.id),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Carols table - consolidate from client store
export const carols = mysqlTable("carols", {
  id: varchar("id", { length: 191 }).primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  tags: json("tags").$type<string[]>(),
  duration: text("duration").notNull(),
  lyrics: json("lyrics").$type<string[]>(),
  energy: varchar("energy", { length: 50 }).$type<'low' | 'medium' | 'high'>().notNull(),
  coverUrl: text("cover_url"),
  votes: int("votes").default(0),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Contributions table
export const contributions = mysqlTable("contributions", {
  id: varchar("id", { length: 191 }).primaryKey(),
  eventId: varchar("event_id", { length: 191 }).notNull().references(() => events.id),
  memberId: varchar("member_id", { length: 191 }).notNull().references(() => users.id),
  item: text("item").notNull(),
  status: varchar("status", { length: 50 }).$type<'proposed' | 'confirmed' | 'brought'>().default('proposed'),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Messages table
export const messages = mysqlTable("messages", {
  id: varchar("id", { length: 191 }).primaryKey(),
  eventId: varchar("event_id", { length: 191 }).notNull().references(() => events.id),
  memberId: varchar("member_id", { length: 191 }).notNull().references(() => users.id),
  text: text("text").notNull(),
  timestamp: datetime("timestamp").default(sql`CURRENT_TIMESTAMP`),
});

// Zod schemas - single source of truth
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  members: true,
  carols: true,
  createdAt: true,
}).extend({
  createdBy: z.string(),
});

export const insertCarolSchema = createInsertSchema(carols).omit({
  id: true,
  votes: true,
});

export const insertContributionSchema = createInsertSchema(contributions).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

// Types - unified across client/server
export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Carol = typeof carols.$inferSelect;
export type Contribution = typeof contributions.$inferSelect;
export type Message = typeof messages.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertCarol = z.infer<typeof insertCarolSchema>;
export type InsertContribution = z.infer<typeof insertContributionSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
