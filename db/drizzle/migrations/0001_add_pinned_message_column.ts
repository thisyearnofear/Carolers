import { sql } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";

// Migration to sync the events table with the schema
export async function up(db: MySql2Database<any>) {
  // Add the missing pinned_message column to the events table
  await db.execute(sql`ALTER TABLE events ADD COLUMN pinned_message TEXT`);
}

export async function down(db: MySql2Database<any>) {
  // Remove the pinned_message column from the events table
  await db.execute(sql`ALTER TABLE events DROP COLUMN pinned_message`);
}