// Server utility for getting user info
import { currentUser } from '@clerk/nextjs/server';
import { getDb } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function getCurrentUser() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return null;
    }

    const db = await getDb();

    // Check if user exists in our DB
    const [existingUser] = await db.select().from(users).where(eq(users.id, clerkUser.id));

    if (existingUser) {
      return existingUser;
    }

    // If not, sync them to our DB
    // Use primary email or fallback
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;
    const username = clerkUser.username || clerkUser.firstName || email?.split('@')[0] || 'Anonymous';

    const newUser = {
      id: clerkUser.id,
      username,
      email,
      imageUrl: clerkUser.imageUrl,
    };

    await db.insert(users).values(newUser);

    return newUser;
  } catch (error) {
    console.error('Failed to get or sync user:', error);
    return null;
  }
}