// CLEAN: Database connection and initialization using standard MySQL
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sql } from 'drizzle-orm';
import * as schema from '@shared/schema';

// MODULAR: Connection pool for better performance in production
let pool: mysql.Pool | null = null;

function getPool() {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is required');
    }
    pool = mysql.createPool(url);
  }
  return pool;
}

// ENHANCEMENT FIRST: Single database instance with mysql2
export const db = drizzle(getPool(), { schema, mode: 'default' });

// CLEAN: Connection health check
export async function checkDatabaseConnection(): Promise<void> {
  try {
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection established successfully (TiDB)');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function initializeDatabase(): Promise<void> {
  console.log('🔄 Initializing database connection...');
  await checkDatabaseConnection();
  console.log('🚀 Database ready');
}

export async function closeDatabaseConnection(): Promise<void> {
  if (pool) {
    console.log('🔌 Closing database connection...');
    await pool.end();
    pool = null;
    console.log('✅ Database connection closed');
  }
}
