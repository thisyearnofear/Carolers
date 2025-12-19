// MODULAR: User synchronization hook for Clerk + PlanetScale
import { useEffect } from 'react';
import { useAppUser } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

// CLEAN: User synchronization status
interface UserSyncStatus {
  isSyncing: boolean;
  syncError: string | null;
  lastSynced: Date | null;
}

// ENHANCEMENT FIRST: User synchronization hook
export function useUserSync(): UserSyncStatus & {
  syncUser: () => Promise<void>;
  checkSyncStatus: () => Promise<boolean>;
} {
  const { user } = useAppUser();
  const navigate = useNavigate();

  // MODULAR: Sync user data to backend
  const syncUser = async () => {
    if (!user) {
      console.warn('No user to sync');
      return;
    }

    try {
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          username: user.name,
          email: user.email,
          imageUrl: user.imageUrl,
          // Note: Clerk React SDK doesn't provide firstName/lastName separately
          // in the basic user object, but we can use the full name
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Sync failed');
      }

      console.log('✅ User synchronized:', result.userId);
      return result.userId;

    } catch (error) {
      console.error('❌ User sync failed:', error.message);
      throw error;
    }
  };

  // CLEAN: Check if user needs synchronization
  const checkSyncStatus = async () => {
    if (!user) return false;

    try {
      const response = await fetch(`/api/users/${user.id}/needs-sync`);
      const result = await response.json();
      return result.needsSync || false;
    } catch (error) {
      console.error('Sync status check failed:', error.message);
      // If we can't check, assume they need sync
      return true;
    }
  };

  // PERFORMANT: Auto-sync on user change
  useEffect(() => {
    if (user) {
      const syncIfNeeded = async () => {
        try {
          const needsSync = await checkSyncStatus();
          if (needsSync) {
            await syncUser();
          }
        } catch (error) {
          console.error('Auto-sync failed:', error.message);
        }
      };

      // Small delay to avoid race conditions
      const timer = setTimeout(syncIfNeeded, 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // DRY: Status management
  const status: UserSyncStatus = {
    isSyncing: false, // Would need state management for real tracking
    syncError: null,
    lastSynced: null,
  };

  return {
    ...status,
    syncUser,
    checkSyncStatus,
  };
}

// ENHANCEMENT FIRST: Hook for manual user synchronization
export function useManualUserSync() {
  const { user } = useAppUser();
  const { syncUser, checkSyncStatus } = useUserSync();

  const manualSync = async () => {
    if (!user) {
      alert('Please sign in first');
      return;
    }

    try {
      await syncUser();
      alert('✅ User data synchronized successfully!');
    } catch (error) {
      console.error('Manual sync failed:', error);
      alert('❌ Sync failed. Check console for details.');
    }
  };

  return {
    manualSync,
    checkSyncStatus,
    user,
  };
}