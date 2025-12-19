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

## 4. Troubleshooting

- **Connection Errors:** Ensure your IP is allowed in TiDB (or set to allow all: `0.0.0.0/0`) and that your `DATABASE_URL` is correct.
- **SSL Issues:** The connection string must include `?ssl={"rejectUnauthorized":true}` to ensure a secure connection.
