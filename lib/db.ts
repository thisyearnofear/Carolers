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

  const connection = await createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'carolers',
  });

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
