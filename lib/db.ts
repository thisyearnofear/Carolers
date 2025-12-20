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
    console.log('Initializing database connection...');
    
    // For TiDB, always use SSL. Extract basic config from DATABASE_URL
    let host = 'localhost';
    let port = 3306;
    let user = 'root';
    let password = '';
    let database = 'carolers';

    if (process.env.DATABASE_URL) {
      try {
        // DATABASE_URL format: mysql://user:pass@host:port/database?...
        const urlStr = process.env.DATABASE_URL.split('?')[0]; // Remove query params
        const url = new URL(urlStr);
        host = url.hostname;
        port = parseInt(url.port || '3306');
        user = url.username;
        password = decodeURIComponent(url.password);
        database = url.pathname.slice(1);
      } catch (e) {
        console.warn('Failed to parse DATABASE_URL, using env vars', e);
      }
    }

    // Create pool with TiDB serverless best practices
    const pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      // TiDB requires SSL
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      },
      // Serverless optimization
      connectionLimit: 1,
      maxIdle: 1,
      enableKeepAlive: true,
      waitForConnections: true,
    });

    const dbInstance = drizzle({ client: pool, schema, mode: 'default' });
    cachedDb = dbInstance;

    console.log('Database connection initialized');
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
