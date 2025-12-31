# Database Setup

## Schema Synchronization

The application uses Drizzle ORM for database schema management. If you encounter database schema errors, follow these steps:

1. **Check current schema vs database**:
   ```bash
   npx drizzle-kit generate
   ```

2. **Apply schema changes to database**:
   ```bash
   npx drizzle-kit push
   ```

## Known Issues

- If you see an error about `pinned_message` column not existing in the `events` table, run the migration command above.
- The schema defines a `pinned_message` column in the `events` table, but it may not exist in your database if you have an older version.

## Migration Files

Migration files are stored in the `drizzle/migrations/` directory. The first migration (`0001_add_pinned_message_column.ts`) adds the missing `pinned_message` column to the events table to sync with the schema definition.