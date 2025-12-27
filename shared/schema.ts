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
  preferredLanguage: varchar("preferred_language", { length: 10 }).default('en'),
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
  pinnedMessage: text("pinned_message"), // Pinned message by host
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
  language: varchar("language", { length: 10 }).default('en'),
  energy: varchar("energy", { length: 50 }).$type<'low' | 'medium' | 'high'>().notNull(),
  coverUrl: text("cover_url"),
  votes: int("votes").default(0),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Contributions table
export const contributions = mysqlTable("contributions", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  eventId: varchar("event_id", { length: 191 }).notNull().references(() => events.id),
  memberId: varchar("member_id", { length: 191 }).notNull().references(() => users.id),
  item: text("item").notNull(),
  status: varchar("status", { length: 50 }).$type<'proposed' | 'confirmed' | 'brought'>().default('proposed'),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Messages table
export const messages = mysqlTable("messages", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  eventId: varchar("event_id", { length: 191 }).notNull().references(() => events.id),
  memberId: varchar("member_id", { length: 191 }).notNull().references(() => users.id),
  text: text("text").notNull(),
  type: varchar("type", { length: 50 }).$type<'text' | 'system' | 'carol' | 'poll' | 'ai'>().default('text'),
  payload: json("payload").$type<any>(),
  timestamp: datetime("timestamp").default(sql`CURRENT_TIMESTAMP`),
});

// Carol Translations - Community-owned, voted on translations per language
export const carolTranslations = mysqlTable("carol_translations", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  carolId: varchar("carol_id", { length: 191 }).notNull().references(() => carols.id),
  language: varchar("language", { length: 10 }).notNull(),
  title: text("title").notNull(),
  lyrics: json("lyrics").$type<string[]>(),
  upvotes: int("upvotes").default(0),
  downvotes: int("downvotes").default(0),
  isCanonical: int("is_canonical").default(0), // highest-voted becomes canonical
  createdBy: varchar("created_by", { length: 191 }).references(() => users.id),
  source: varchar("source", { length: 50 }).$type<'ai_generated' | 'user_submitted'>().default('ai_generated'),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Translation Proposals - Wikipedia-style proposal queue for edits
export const translationProposals = mysqlTable("translation_proposals", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  translationId: varchar("translation_id", { length: 191 }).notNull().references(() => carolTranslations.id),
  proposedBy: varchar("proposed_by", { length: 191 }).notNull().references(() => users.id),
  newTitle: text("new_title"),
  newLyrics: json("new_lyrics").$type<string[]>(),
  changeReason: text("change_reason"),
  status: varchar("status", { length: 50 }).$type<'pending' | 'approved' | 'rejected' | 'merged'>().default('pending'),
  upvotes: int("upvotes").default(0),
  downvotes: int("downvotes").default(0),
  requiredQuorum: int("required_quorum").default(5),
  votingEndsAt: datetime("voting_ends_at"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Proposal Votes - Track voting with reputation-weighted power
export const proposalVotes = mysqlTable("proposal_votes", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  proposalId: varchar("proposal_id", { length: 191 }).notNull().references(() => translationProposals.id),
  userId: varchar("user_id", { length: 191 }).notNull().references(() => users.id),
  vote: int("vote").$type<-1 | 1>().notNull(),
  votingPower: int("voting_power").default(1), // 1 + floor(reputation / 100)
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Contributor Reputation - Track expertise & voting power per language
export const contributorReputation = mysqlTable("contributor_reputation", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 191 }).notNull().references(() => users.id),
  language: varchar("language", { length: 10 }).notNull(),
  translationsApproved: int("translations_approved").default(0),
  proposalsApproved: int("proposals_approved").default(0),
  repPoints: int("rep_points").default(0),
  isModerator: int("is_moderator").default(0),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Translation History - Full audit trail like Wikipedia
export const translationHistory = mysqlTable("translation_history", {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  translationId: varchar("translation_id", { length: 191 }).notNull().references(() => carolTranslations.id),
  proposalId: varchar("proposal_id", { length: 191 }).references(() => translationProposals.id),
  previousTitle: text("previous_title"),
  previousLyrics: json("previous_lyrics").$type<string[]>(),
  changedBy: varchar("changed_by", { length: 191 }).notNull().references(() => users.id),
  changeReason: text("change_reason"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
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

export const insertCarolTranslationSchema = createInsertSchema(carolTranslations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTranslationProposalSchema = createInsertSchema(translationProposals).omit({
  id: true,
  createdAt: true,
}).extend({
  votingEndsAt: z.coerce.date(),
});

export const insertProposalVoteSchema = createInsertSchema(proposalVotes).omit({
  id: true,
  createdAt: true,
});

export const insertContributorReputationSchema = createInsertSchema(contributorReputation).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTranslationHistorySchema = createInsertSchema(translationHistory).omit({
  id: true,
  createdAt: true,
});

// Types - unified across client/server
export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Carol = typeof carols.$inferSelect;
export type Contribution = typeof contributions.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type CarolTranslation = typeof carolTranslations.$inferSelect;
export type TranslationProposal = typeof translationProposals.$inferSelect;
export type ProposalVote = typeof proposalVotes.$inferSelect;
export type ContributorReputation = typeof contributorReputation.$inferSelect;
export type TranslationHistory = typeof translationHistory.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertCarol = z.infer<typeof insertCarolSchema>;
export type InsertContribution = z.infer<typeof insertContributionSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertCarolTranslation = z.infer<typeof insertCarolTranslationSchema>;
export type InsertTranslationProposal = z.infer<typeof insertTranslationProposalSchema>;
export type InsertProposalVote = z.infer<typeof insertProposalVoteSchema>;
export type InsertContributorReputation = z.infer<typeof insertContributorReputationSchema>;
export type InsertTranslationHistory = z.infer<typeof insertTranslationHistorySchema>;
