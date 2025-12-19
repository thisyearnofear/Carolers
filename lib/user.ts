// Server utility for getting user info
import { auth } from '@clerk/nextjs/server';

export async function getCurrentUser() {
  try {
    const { userId } = auth();

    if (!userId) {
      return null;
    }

    // In a real app, you would fetch user details from the database
    // For now, return a minimal user object
    return {
      id: userId,
      // In a real app, you would fetch additional details from the users table
    };
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
}