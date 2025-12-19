import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { pollingService } from '@/lib/polling';

/**
 * MODULAR: Hook for on-demand event data polling
 * PERFORMANT: Fetches fresh data when user interacts (votes, messages)
 * DRY: Centralizes polling logic for the Room component
 */
export function useEventPolling(eventId: string) {
  const updateEvent = useRef<(event: any) => void>();
  const isPollingRef = useRef(false);

  // Refresh event data (carols, messages, contributions)
  const refreshEventData = useCallback(async () => {
    if (!eventId || isPollingRef.current) return;

    try {
      isPollingRef.current = true;
      const freshEvent = await pollingService.refreshEvent(eventId);
      
      // Update store with fresh data by triggering store reload
      const { loadEventData } = useStore.getState();
      await loadEventData(eventId);
    } catch (error) {
      console.error('Failed to refresh event data:', error);
    } finally {
      isPollingRef.current = false;
    }
  }, [eventId]);

  // Trigger refresh on vote or message
  const triggerRefresh = useCallback(() => {
    refreshEventData();
  }, [refreshEventData]);

  return { triggerRefresh, refreshEventData };
}
