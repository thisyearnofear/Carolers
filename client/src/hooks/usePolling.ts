import { useEffect, useRef, useCallback } from 'react';

/**
 * PERFORMANT: On-demand polling hook for fetching fresh data
 * Only polls when user interacts with features that need updates
 * DRY: Single source of truth for polling logic
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  onDataUpdate: (data: T) => void,
  intervalMs: number = 3000
) {
  const intervalRef = useRef<NodeJS.Timer | null>(null);
  const isPollingRef = useRef(false);

  // Start polling
  const startPolling = useCallback(() => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    // Fetch immediately
    fetchFn().then(onDataUpdate).catch(console.error);

    // Then poll
    intervalRef.current = setInterval(() => {
      fetchFn().then(onDataUpdate).catch(console.error);
    }, intervalMs);
  }, [fetchFn, onDataUpdate, intervalMs]);

  // Stop polling
  const stopPolling = useCallback(() => {
    isPollingRef.current = false;
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current as unknown as NodeJS.Timeout);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { startPolling, stopPolling };
}
