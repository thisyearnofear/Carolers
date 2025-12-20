import 'server-only';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '@shared/schema';

let cachedDb: ReturnType<typeof drizzle> | undefined;
let dbPromise: Promise<ReturnType<typeof drizzle>> | undefined;

async function initializeDb() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    console.log('Creating database connection pool...');
    
    // Parse DATABASE_URL if available (format: mysql://user:pass@host:port/database?ssl=...)
    let poolConfig: any;
    
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL);
      poolConfig = {
        host: url.hostname,
        port: parseInt(url.port || '3306'),
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        ssl: url.searchParams.get('ssl') === 'true' ? {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: true,
        } : undefined,
      };
    } else {
      // Fallback to individual env vars
      poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'carolers',
      };
    }

    // Optimize for serverless: connectionLimit 1, enable keepalive
    const pool = mysql.createPool({
      ...poolConfig,
      connectionLimit: 1,
      maxIdle: 1,
      enableKeepAlive: true,
    });

    console.log('Database connection pool initialized');

    // Pass pool directly to drizzle with { client: pool }
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
