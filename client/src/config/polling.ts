/**
 * PERFORMANT: Polling configuration for Vercel serverless
 * Optimized to minimize database queries while maintaining UX
 */

export const POLLING_CONFIG = {
  // On-demand polling (triggered after user actions)
  onDemand: {
    // Immediately fetch after vote/message/contribution
    immediate: true,
    // Debounce multiple actions within 2s to single request
    debounceMs: 2000,
  },

  // Optional: Background polling when user is active (disabled by default)
  background: {
    enabled: false,
    // Only enable if polling messages/votes in real-time
    intervalMs: 10000, // 10 seconds to reduce DB load
    // Stop polling after 5 minutes of inactivity
    inactivityTimeoutMs: 300000,
  },

  // Retry configuration for failed requests
  retry: {
    enabled: true,
    maxAttempts: 3,
    backoffMs: 1000, // 1s, 2s, 3s exponential backoff
  },
} as const;
