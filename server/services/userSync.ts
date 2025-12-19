// MODULAR: User synchronization service between Clerk and Database
import { DatabaseStorage } from '../storage/DatabaseStorage';
import { InsertUser } from '@shared/schema';
import { log } from '../index';

// CLEAN: User synchronization interface
interface ClerkUserData {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
}

// ENHANCEMENT FIRST: User synchronization service
class UserSyncService {
  private storage: DatabaseStorage;

  constructor() {
    this.storage = new DatabaseStorage();
  }

  // MODULAR: Sync user from Clerk to database
  async syncClerkUser(clerkUser: ClerkUserData): Promise<void> {
    try {
      // Transform Clerk user data to our database schema
      const userData: InsertUser = {
        id: clerkUser.id,
        username: this.generateUsername(clerkUser),
        email: clerkUser.email,
        imageUrl: clerkUser.imageUrl,
      };

      // Use upsert to create or update user
      const syncedUser = await this.storage.upsertUser(userData);

      log(`🔄 User synchronized: ${syncedUser.id} (${syncedUser.username})`, 'user-sync');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`❌ User sync failed for ${clerkUser.id}: ${errorMessage}`, 'user-sync');
      throw error;
    }
  }

  // CLEAN: Generate username from Clerk data
  private generateUsername(clerkUser: ClerkUserData): string {
    if (clerkUser.username) return clerkUser.username;
    
    const firstName = clerkUser.firstName || 'User';
    const lastName = clerkUser.lastName || '';
    
    // Create username from name parts
    const baseUsername = [firstName, lastName]
      .filter(Boolean)
      .join('_')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');

    // Add timestamp to ensure uniqueness
    return `${baseUsername}_${Date.now().toString().slice(-4)}`;
  }

  // PERFORMANT: Batch sync multiple users
  async syncMultipleUsers(users: ClerkUserData[]): Promise<void> {
    try {
      for (const user of users) {
        await this.syncClerkUser(user);
      }
      log(`🔄 Batch sync completed: ${users.length} users`, 'user-sync');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`❌ Batch sync failed: ${errorMessage}`, 'user-sync');
      throw error;
    }
  }

  // CLEAN: Get user by Clerk ID
  async getUserByClerkId(clerkId: string): Promise<any> {
    try {
      return await this.storage.getUser(clerkId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`❌ Failed to get user ${clerkId}: ${errorMessage}`, 'user-sync');
      throw error;
    }
  }

  // ENHANCEMENT FIRST: Check if user needs sync
  async needsSync(clerkId: string): Promise<boolean> {
    try {
      const existingUser = await this.storage.getUser(clerkId);
      return !existingUser;
    } catch (error) {
      // If we can't find the user, assume they need sync
      return true;
    }
  }
}

// DRY: Singleton instance for easy access
export const userSyncService = new UserSyncService();

export { UserSyncService, ClerkUserData };