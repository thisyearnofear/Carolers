import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Events table - consolidate from client store
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  date: timestamp("date").notNull(),
  theme: text("theme").notNull(),
  venue: text("venue"),
  description: text("description").notNull(),
  members: json("members").$type<string[]>().default([]),
  carols: json("carols").$type<string[]>().default([]),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Carols table - consolidate from client store
export const carols = pgTable("carols", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  tags: json("tags").$type<string[]>().default([]),
  duration: text("duration").notNull(),
  lyrics: json("lyrics").$type<string[]>().default([]),
  energy: text("energy").$type<'low' | 'medium' | 'high'>().notNull(),
  coverUrl: text("cover_url"),
  votes: json("votes").$type<number>().default(0),
});

// Contributions table
export const contributions = pgTable("contributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  memberId: varchar("member_id").notNull().references(() => users.id),
  item: text("item").notNull(),
  status: text("status").$type<'proposed' | 'confirmed' | 'brought'>().default('proposed'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  memberId: varchar("member_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Zod schemas - single source of truth
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  members: true,
  carols: true,
  createdAt: true,
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
