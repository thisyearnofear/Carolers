import { drizzle } from 'drizzle-orm/mysql2';
import { createConnection } from 'mysql2/promise';
import * as schema from '@shared/schema';

let dbConnection: ReturnType<typeof createConnection> | undefined;
let cachedDb: ReturnType<typeof drizzle> | undefined;

export async function getDbConnection() {
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

  const db = drizzle(connection, { schema });
  cachedDb = db;
  dbConnection = connection;

  return db;
}

export const db = await getDbConnection();