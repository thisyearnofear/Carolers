# Database Migrations & Setup

This project uses **TiDB Serverless** (MySQL-compatible) with **Drizzle ORM** for database management.

## 1. Prerequisites

- Node.js & npm installed
- A TiDB Cloud account (free serverless tier available)

## 2. Setup

1.  Create a TiDB Serverless cluster.
2.  Obtain your connection string (Standard Connection).
3.  Create a `.env` file in the root directory:

```env
DATABASE_URL='mysql://<username>:<password>@<host>:4000/<database>?ssl={"rejectUnauthorized":true}'
```

## 3. Migration Commands

- **Push Schema changes:**
  Syncs your schema definition (`shared/schema.ts`) directly to the database.
  ```bash
  npm run db:push
  ```

- **Generate Migration Files:**
  Creates SQL migration files based on schema changes (for version control).
  ```bash
  npm run db:generate
  ```

- **Run Migrations:**
  Applies generated migration files to the database.
  ```bash
  npm run db:migrate
  ```

- **Seed Data:**
  Populates the database with initial carol lyrics.
  ```bash
  npx tsx script/seed-lyrics.ts
  ```

## 4. Schema: Collaborative Translation Tables

Phase 5 introduces Wikipedia-style collaborative translation with DAO governance:

```typescript
// carol_translations: Approved & canonical translations per language
export const carolTranslations = mysqlTable("carol_translations", {
  id: varchar("id", { length: 191 }).primaryKey(),
  carolId: varchar("carol_id", { length: 191 }).references(() => carols.id),
  language: varchar("language", { length: 10 }).notNull(),
  title: text("title").notNull(),
  lyrics: json("lyrics").$type<string[]>(),
  upvotes: int("upvotes").default(0),
  downvotes: int("downvotes").default(0),
  isCanonical: int("is_canonical").default(0), // highest-voted = canonical
  createdBy: varchar("created_by", { length: 191 }).references(() => users.id),
  source: varchar("source", { length: 50 }).$type<'ai_generated' | 'user_submitted'>(),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// translationProposals: Proposal queue for edits (Wikipedia-style)
export const translationProposals = mysqlTable("translation_proposals", {
  id: varchar("id", { length: 191 }).primaryKey(),
  translationId: varchar("translation_id", { length: 191 }).references(() => carolTranslations.id),
  proposedBy: varchar("proposed_by", { length: 191 }).references(() => users.id).notNull(),
  newTitle: text("new_title"),
  newLyrics: json("new_lyrics").$type<string[]>(),
  changeReason: text("change_reason"),
  status: varchar("status", { length: 50 }).$type<'pending' | 'approved' | 'rejected' | 'merged'>().default('pending'),
  upvotes: int("upvotes").default(0),
  downvotes: int("downvotes").default(0),
  requiredQuorum: int("required_quorum"),
  votingEndsAt: datetime("voting_ends_at"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// proposalVotes: Prevent double voting, track reputation-weighted votes
export const proposalVotes = mysqlTable("proposal_votes", {
  id: varchar("id", { length: 191 }).primaryKey(),
  proposalId: varchar("proposal_id", { length: 191 }).references(() => translationProposals.id),
  userId: varchar("user_id", { length: 191 }).references(() => users.id),
  vote: int("vote").$type<-1 | 1>(),
  votingPower: int("voting_power").default(1), // 1 + floor(reputation / 100)
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// contributorReputation: Track expertise & voting power per language
export const contributorReputation = mysqlTable("contributor_reputation", {
  id: varchar("id", { length: 191 }).primaryKey(),
  userId: varchar("user_id", { length: 191 }).references(() => users.id),
  language: varchar("language", { length: 10 }),
  translationsApproved: int("translations_approved").default(0),
  proposalsApproved: int("proposals_approved").default(0),
  repPoints: int("rep_points").default(0),
  isModerator: int("is_moderator").default(0),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// translationHistory: Full audit trail (like Wikipedia history)
export const translationHistory = mysqlTable("translation_history", {
  id: varchar("id", { length: 191 }).primaryKey(),
  translationId: varchar("translation_id", { length: 191 }).references(() => carolTranslations.id),
  proposalId: varchar("proposal_id", { length: 191 }).references(() => translationProposals.id),
  previousTitle: text("previous_title"),
  previousLyrics: json("previous_lyrics").$type<string[]>(),
  changedBy: varchar("changed_by", { length: 191 }).references(() => users.id),
  changeReason: text("change_reason"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Extend users table with preferred language preference
// ALTER TABLE users ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en';
```

## 5. Troubleshooting

- **Connection Errors:** Ensure your IP is allowed in TiDB (or set to allow all: `0.0.0.0/0`) and that your `DATABASE_URL` is correct.
- **SSL Issues:** The connection string must include `?ssl={"rejectUnauthorized":true}` to ensure a secure connection.
