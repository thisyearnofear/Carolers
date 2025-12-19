// MODULAR: Database migration script
import { drizzle } from 'drizzle-orm/planetscale-serverless';
import { connect } from '@planetscale/database';
import { migrate } from 'drizzle-orm/planetscale-serverless/migrator';
import * as schema from '@shared/schema';
import { log } from '../server/index';

// CLEAN: Migration function
async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for migrations');
  }

  console.log('🔄 Starting database migrations...');
  
  try {
    // Create connection
    const connection = connect({
      url: databaseUrl,
      fetch: (url: string, init: any) => {
        delete (init as any)['cache'];
        return fetch(url, init);
      },
    });

    const db = drizzle(connection, { schema });
    
    // Run migrations
    await migrate(db, { migrationsFolder: './migrations' });
    
    console.log('✅ Database migrations completed successfully');
    
    // Close connection
    await connection.close();
    
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