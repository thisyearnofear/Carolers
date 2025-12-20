import 'server-only';
import { drizzle } from 'drizzle-orm/mysql2';
import { createPool } from 'mysql2/promise';
import * as schema from '@shared/schema';

let cachedDb: ReturnType<typeof drizzle> | undefined;
let dbPromise: Promise<ReturnType<typeof drizzle>> | undefined;

async function initializeDb() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    // Use DATABASE_URL (Vercel/prod) or fall back to individual env vars (dev)
    const connectionString = process.env.DATABASE_URL ||
      `mysql://${process.env.DB_USER || 'root'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${process.env.DB_NAME || 'carolers'}`;

    console.log('Creating database connection pool...');
    
    // Create pool from connection string
    const pool = createPool(connectionString);
    
    console.log('Database pool initialized');

    // Pass pool directly to drizzle
    const dbInstance = drizzle({ client: pool, schema, mode: 'default' });
    cachedDb = dbInstance;

    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export async function getDb() {
  if (!dbPromise) {
    dbPromise = initializeDb();
  }
  return dbPromise;
}
