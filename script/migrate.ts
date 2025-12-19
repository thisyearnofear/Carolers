// MODULAR: Database migration script
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import * as schema from '@shared/schema';

// CLEAN: Migration function
async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for migrations');
  }

  console.log('🔄 Starting database migrations...');
  
  try {
    // Create connection
    const connection = await mysql.createConnection(databaseUrl);
    const db = drizzle(connection, { schema, mode: 'default' });
    
    // Run migrations
    await migrate(db, { migrationsFolder: './migrations' });
    
    console.log('✅ Database migrations completed successfully');
    
    // Close connection
    await connection.end();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// ENHANCEMENT FIRST: Run migrations if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations().catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  });
}

export { runMigrations };