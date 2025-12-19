// MODULAR: Single source of truth for auth logic
import { useUser, useAuth } from '@clerk/clerk-react';

export interface AppUser {
  id: string;
  name: string;
  email?: string;
  imageUrl?: string;
  isAuthenticated: boolean;
}

// DRY: Reusable hook for consistent user data across app
export function useAppUser(): { 
  user: AppUser | null; 
  isLoading: boolean;
  signOut: () => Promise<void>;
} {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useAuth();

  const user: AppUser | null = clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.fullName || clerkUser.firstName || 'User',
    email: clerkUser.primaryEmailAddress?.emailAddress,
    imageUrl: clerkUser.imageUrl,
    isAuthenticated: true,
  } : null;

  return {
    user,
    isLoading: !isLoaded,
    signOut,
  };
}

// ENHANCEMENT FIRST: Helper for backward compatibility with existing hardcoded user
export function getCurrentUserId(appUser: AppUser | null): string {
  return appUser?.id || 'user1'; // Fallback for development
}