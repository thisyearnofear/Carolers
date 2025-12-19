import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { pollingService } from '@/lib/polling';
import { POLLING_CONFIG } from '@/config/polling';

/**
 * MODULAR: Hook for on-demand event data polling
 * PERFORMANT: Debounced refresh to minimize DB queries on Vercel
 * DRY: Centralizes polling logic for the Room component
 */
export function useEventPolling(eventId: string) {
  const isPollingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // Refresh event data with retry logic
  const refreshEventData = useCallback(async () => {
    if (!eventId || isPollingRef.current) return;

    try {
      isPollingRef.current = true;
      retryCountRef.current = 0;
      
      const freshEvent = await pollingService.refreshEvent(eventId);
      
      // Update store with fresh data
      const { loadEventData } = useStore.getState();
      await loadEventData(eventId);
    } catch (error) {
      // Retry with exponential backoff
      if (POLLING_CONFIG.retry.enabled && retryCountRef.current < POLLING_CONFIG.retry.maxAttempts) {
        retryCountRef.current++;
        const delayMs = POLLING_CONFIG.retry.backoffMs * retryCountRef.current;
        console.warn(`Polling failed, retrying in ${delayMs}ms...`, error);
        
        setTimeout(() => {
          isPollingRef.current = false;
          refreshEventData();
        }, delayMs);
        return;
      }
      
      console.error('Failed to refresh event data after retries:', error);
    } finally {
      isPollingRef.current = false;
    }
  }, [eventId]);

  // Debounced trigger to coalesce multiple rapid actions
  const triggerRefresh = useCallback(() => {
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      refreshEventData();
    }, POLLING_CONFIG.onDemand.debounceMs);
  }, [refreshEventData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return { triggerRefresh, refreshEventData };
}
