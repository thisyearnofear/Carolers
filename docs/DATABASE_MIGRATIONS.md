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

## 4. Schema: User-Generated Carols (Suno AI)

Users can now create original carols powered by Suno AI. The system tracks generation jobs, status, and completion:

```typescript
// user_carols: Track AI-generated carols from users
export const userCarols = mysqlTable("user_carols", {
  id: varchar("id", { length: 191 }).primaryKey(),
  sunoJobId: varchar("suno_job_id", { length: 191 }).notNull(), // Suno API job ID
  createdBy: varchar("created_by", { length: 191 }).references(() => users.id),
  title: text("title").notNull(),
  lyrics: text("lyrics"),
  genre: varchar("genre", { length: 100 }).default('Christmas'),
  style: varchar("style", { length: 100 }).default('Traditional'),
  status: varchar("status", { length: 50 }).$type<'processing' | 'complete' | 'error'>().default('processing'),
  audioUrl: text("audio_url"),
  videoUrl: text("video_url"),
  imageUrl: text("image_url"),
  errorMessage: text("error_message"),
  likes: int("likes").default(0),
  plays: int("plays").default(0),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: datetime("completed_at"),
});
```

### Setup

Add to your `.env.local`:
```env
SUNO_API_KEY=your_api_key_from_sunoapi.org
```

Get your key: https://sunoapi.org/dashboard

Then run:
```bash
npm run db:push
```

### API Endpoints

- `POST /api/carols/generate` - Submit generation request
- `GET /api/carols/{id}/status` - Poll for status updates
- `POST /api/carols/poll-generations` - Background cron job (optional)
- `GET /api/users/{userId}/carols` - Fetch user's carols

### UI

- Modal: Click "Create Carol" on `/songs` page
- Component: `UserCarolsSection` displays created carols with status, audio preview, metrics

## 5. Schema: Collaborative Translation Tables

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

## 6. Troubleshooting

### Connection Issues
- Ensure your IP is allowed in TiDB (or set to allow all: `0.0.0.0/0`)
- Verify `DATABASE_URL` is correct in `.env.local`
- Connection string must include `?ssl={"rejectUnauthorized":true}`

### Suno Generation Issues
- **Carol stuck on processing:** Check Suno API quota at https://sunoapi.org/dashboard
- **"Unauthorized" error:** Verify `SUNO_API_KEY` is set in `.env.local` and restart dev server
- **Empty audio URLs:** Carol may still be processing; wait 60+ seconds or check database error_message
- **"Carol not found" in status check:** Verify carol ID and creator (ownership) in database

### Database Queries

```sql
-- View user-generated carols
SELECT * FROM user_carols WHERE created_by = 'user_id' ORDER BY created_at DESC;

-- Find stuck carols (processing > 2 hours)
SELECT * FROM user_carols 
WHERE status = 'processing' 
AND created_at < DATE_SUB(NOW(), INTERVAL 2 HOUR);

-- Check error messages
SELECT id, title, error_message FROM user_carols WHERE status = 'error';

-- Top liked carols
SELECT * FROM user_carols 
WHERE status = 'complete' 
ORDER BY likes DESC LIMIT 10;
```
