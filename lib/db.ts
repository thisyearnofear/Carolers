import 'server-only';
import { drizzle } from 'drizzle-orm/mysql2';
import { createConnection, Connection } from 'mysql2/promise';
import * as schema from '@shared/schema';

// Ensure this code only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('Database operations are only allowed on the server side');
}

let dbConnection: Connection | undefined;
let cachedDb: ReturnType<typeof drizzle> | undefined;
let dbPromise: Promise<ReturnType<typeof drizzle>> | undefined;

async function initializeDb() {
  if (cachedDb) {
    return cachedDb;
  }

  // Use DATABASE_URL (Vercel/prod) or fall back to individual env vars (dev)
  const connectionString = process.env.DATABASE_URL ||
    `mysql://${process.env.DB_USER || 'root'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${process.env.DB_NAME || 'carolers'}`;

  const connection = await createConnection(connectionString);

  const dbInstance = drizzle(connection, { schema, mode: 'default' });
  cachedDb = dbInstance;
  dbConnection = connection;

  return dbInstance;
}

export async function getDb() {
  if (!dbPromise) {
    dbPromise = initializeDb();
  }
  return dbPromise;
}
