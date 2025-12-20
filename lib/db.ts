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

export async function getDb() {
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

// For convenience, create a singleton that gets initialized on first use
let dbPromise: ReturnType<typeof getDb> | null = null;
export const db = new Proxy({} as Awaited<ReturnType<typeof getDb>>, {
  get(target, prop) {
    if (!dbPromise) dbPromise = getDb();
    return (...args: any[]) => dbPromise!.then((d: any) => {
      const val = d[prop];
      return typeof val === 'function' ? val.apply(d, args) : val;
    });
  }
});
