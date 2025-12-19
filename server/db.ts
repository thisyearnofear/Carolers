// CLEAN: Database connection and initialization
import { drizzle } from 'drizzle-orm/planetscale-serverless';
import { sql } from 'drizzle-orm';
import { Client } from '@planetscale/database';
import * as schema from '@shared/schema';

// MODULAR: Environment-based connection
function createConnection() {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }

  return new Client({
    url,
    fetch: (url: string, init: any) => {
      // PERFORMANT: Custom fetch for better connection pooling
      delete (init as any)['cache'];
      return fetch(url, init);
    },
  });
}

// ENHANCEMENT FIRST: Single database instance
const client = createConnection();
export const db = drizzle(client, { schema });

// DRY: Type-safe database instance
export type Database = typeof db;

// CLEAN: Connection health check
async function checkDatabaseConnection(): Promise<void> {
  try {
    // Simple query to test connection
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// MODULAR: Connection management
let isDatabaseReady = false;

async function initializeDatabase(): Promise<void> {
  if (isDatabaseReady) {
    console.log('ℹ️  Database already initialized');
    return;
  }

  console.log('🔄 Initializing database connection...');
  await checkDatabaseConnection();
  isDatabaseReady = true;
  console.log('🚀 Database ready');
}

// ENHANCEMENT FIRST: Connection retry logic
async function withDatabaseRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      if (!isDatabaseReady) {
        await initializeDatabase();
      }
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        console.error('❌ Database operation failed after retries:', error);
        throw error;
      }
      console.warn(`⚠️  Database operation failed, retrying (${attempt}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw new Error('Unreachable code');
}

// CLEAN: Graceful shutdown
async function closeDatabaseConnection(): Promise<void> {
  try {
    console.log('🔌 Closing database connection...');
    // Note: PlanetScale serverless connections don't need explicit closing
    // but we mark the database as not ready
    isDatabaseReady = false;
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
}

// ENHANCEMENT FIRST: Export database utilities
export { initializeDatabase, checkDatabaseConnection, withDatabaseRetry, closeDatabaseConnection };