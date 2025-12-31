/**
 * Suno API Optimization Configuration
 * Centralized settings for optimal performance and reliability
 */

/**
 * Rate limiting configuration
 * Suno allows 20 requests per 10 seconds
 */
export const RATE_LIMITS = {
  maxRequestsPerWindow: 20,
  windowSizeMs: 10000, // 10 seconds
  // Conservative limits to avoid hitting API limits
  safeMaxRequestsPerWindow: 15,
  minDelayBetweenRequests: 500, // 0.5 seconds minimum between requests
} as const;

/**
 * Polling configuration for status checks
 */
export const POLLING_CONFIG = {
  // Initial delay before first status check (give API time to process)
  initialDelayMs: 5000, // 5 seconds

  // Polling intervals based on generation phase
  intervals: {
    // PENDING phase - check less frequently
    pending: 8000, // 8 seconds
    // TEXT_SUCCESS phase - lyrics generated, audio coming soon
    textSuccess: 5000, // 5 seconds
    // FIRST_SUCCESS phase - first track done, second coming
    firstSuccess: 3000, // 3 seconds
  },

  // Maximum polling duration before timeout
  maxPollingDurationMs: 300000, // 5 minutes

  // Maximum number of consecutive errors before giving up
  maxConsecutiveErrors: 3,
} as const;

/**
 * Retry configuration for API calls
 */
export const RETRY_CONFIG = {
  maxAttempts: 3,

  // Exponential backoff with jitter
  baseDelayMs: 1000,
  maxDelayMs: 30000,

  // Specific delays for different error types
  errorDelays: {
    rateLimit: 12000, // Wait 12 seconds for rate limit
    frequencyTooHigh: 6000, // Wait 6 seconds for frequency errors
    maintenance: 30000, // Wait 30 seconds for maintenance
    networkError: 2000, // Wait 2 seconds for network errors
    genericError: 3000, // Wait 3 seconds for other errors
  },

  // Which errors should trigger retries
  retryableErrors: [
    "rate limit",
    "frequency too high",
    "maintenance",
    "network error",
    "temporarily unavailable",
    "ETIMEDOUT",
    "ECONNRESET",
    "ENOTFOUND",
  ],
} as const;

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  // How long to cache successful generation results
  successfulGenerationTTL: 86400000, // 24 hours in ms

  // How long to cache API status responses
  statusCacheTTL: 0, // Don't cache status - always get fresh data

  // How long to cache error states before retrying
  errorCacheTTL: 60000, // 1 minute
} as const;

/**
 * Generation optimization settings
 */
export const GENERATION_OPTIMIZATION = {
  // Default model selection based on use case
  defaultModels: {
    // For carols, V5 offers best expression for emotional/traditional music
    carol: "V5",
    // For quick demos, V4 is faster
    demo: "V4",
    // For long compositions, V4_5PLUS supports up to 8 minutes
    extended: "V4_5PLUS",
  },

  // Optimal style configurations for carols
  carolStyles: {
    traditional: {
      style:
        "Traditional Christmas, orchestral arrangement with choir, warm and nostalgic",
      styleWeight: 0.75, // Strong adherence to traditional style
      weirdnessConstraint: 0.2, // Low weirdness for familiar sound
      negativeTags: "Electronic, Rap, Heavy Metal, Dubstep",
    },
    modern: {
      style:
        "Modern Christmas pop, upbeat and festive with contemporary production",
      styleWeight: 0.6,
      weirdnessConstraint: 0.4,
      negativeTags: "Death Metal, Screamo, Harsh Noise",
    },
    classical: {
      style: "Classical Christmas, chamber orchestra, baroque influences",
      styleWeight: 0.85,
      weirdnessConstraint: 0.1,
      negativeTags: "Electronic, Synth, Drums, Modern",
    },
    jazz: {
      style: "Jazz Christmas, smooth vocals, piano and brass arrangement",
      styleWeight: 0.7,
      weirdnessConstraint: 0.3,
      negativeTags: "Electronic, Heavy Metal, Techno",
    },
  },

  // Optimal parameters for different vocal types
  vocalOptimization: {
    choir: {
      vocalGender: undefined, // Let AI decide for choir
      prompt: "[Choir] ", // Prefix for choir sections
    },
    male: {
      vocalGender: "m" as const,
      prompt: "[Male Vocal] ",
    },
    female: {
      vocalGender: "f" as const,
      prompt: "[Female Vocal] ",
    },
    duet: {
      vocalGender: undefined,
      prompt: "[Duet] ",
    },
  },
} as const;

/**
 * Request queue configuration
 */
export const QUEUE_CONFIG = {
  // Maximum concurrent generations per user
  maxConcurrentPerUser: 2,

  // Maximum queue size per user
  maxQueueSizePerUser: 5,

  // Priority levels for different request types
  priorities: {
    premium: 1,
    standard: 2,
    demo: 3,
  },
} as const;

/**
 * Error handling configuration
 */
export const ERROR_HANDLING = {
  // User-friendly error messages
  errorMessages: {
    RATE_LIMIT:
      "We're experiencing high demand. Please wait a moment and try again.",
    INSUFFICIENT_CREDITS:
      "Your account has insufficient credits to generate music.",
    INVALID_API_KEY:
      "There's an issue with our music generation service. Please contact support.",
    MAINTENANCE:
      "The music generation service is temporarily under maintenance.",
    NETWORK_ERROR:
      "Connection issue detected. Please check your internet and try again.",
    TIMEOUT: "The generation is taking longer than expected. Please try again.",
    INVALID_CONTENT:
      "Your content contains restricted terms. Please modify and try again.",
    GENERIC: "Something went wrong. Please try again.",
  },

  // Which errors should be reported to monitoring
  reportableErrors: ["INVALID_API_KEY", "MAINTENANCE", "NETWORK_ERROR"],
} as const;

/**
 * Performance monitoring thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  // Alert if generation takes longer than these times
  generationTimeWarning: 120000, // 2 minutes
  generationTimeError: 240000, // 4 minutes

  // Alert if API response time exceeds these
  apiResponseTimeWarning: 5000, // 5 seconds
  apiResponseTimeError: 15000, // 15 seconds

  // Success rate thresholds
  successRateWarning: 0.9, // Warn if success rate drops below 90%
  successRateError: 0.75, // Error if success rate drops below 75%
} as const;

/**
 * Helper function to get optimal generation parameters based on context
 */
export function getOptimalParams(
  type: "traditional" | "modern" | "classical" | "jazz" = "traditional",
  duration: number = 120, // seconds
) {
  const style = GENERATION_OPTIMIZATION.carolStyles[type];

  // Select best model based on duration
  let model = "V5"; // Default
  if (duration > 240) {
    model = "V4_5PLUS"; // Supports up to 8 minutes
  } else if (duration <= 60) {
    model = "V4"; // Faster for short clips
  }

  return {
    model,
    ...style,
    customMode: true,
  };
}

/**
 * Helper to calculate retry delay with jitter
 */
export function calculateRetryDelay(
  attemptNumber: number,
  errorType?: string,
): number {
  let baseDelay: number = RETRY_CONFIG.baseDelayMs;

  // Check for specific error type delays
  if (errorType) {
    const errorTypeLower = errorType.toLowerCase();
    for (const [key, delay] of Object.entries(RETRY_CONFIG.errorDelays)) {
      if (errorTypeLower.includes(key.toLowerCase())) {
        baseDelay = delay as number;
        break;
      }
    }
  }

  // Exponential backoff with jitter
  const exponentialDelay = Math.min(
    baseDelay * Math.pow(2, attemptNumber - 1),
    RETRY_CONFIG.maxDelayMs,
  );

  // Add jitter (±20% randomness)
  const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);

  return Math.round(exponentialDelay + jitter);
}

/**
 * Helper to determine if an error is retryable
 */
export function isRetryable(error: any): boolean {
  const errorMessage = (error?.message || "").toLowerCase();

  return RETRY_CONFIG.retryableErrors.some((retryableError) =>
    errorMessage.includes(retryableError.toLowerCase()),
  );
}

/**
 * Helper to get polling interval based on current status
 */
export function getPollingInterval(status: string): number {
  switch (status) {
    case "PENDING":
      return POLLING_CONFIG.intervals.pending;
    case "TEXT_SUCCESS":
      return POLLING_CONFIG.intervals.textSuccess;
    case "FIRST_SUCCESS":
      return POLLING_CONFIG.intervals.firstSuccess;
    default:
      return POLLING_CONFIG.intervals.pending;
  }
}

/**
 * Helper to track API rate limiting
 */
class RateLimiter {
  private requests: number[] = [];

  canMakeRequest(): boolean {
    const now = Date.now();
    const windowStart = now - RATE_LIMITS.windowSizeMs;

    // Remove requests outside the current window
    this.requests = this.requests.filter((time) => time > windowStart);

    // Check if we're under the limit
    return this.requests.length < RATE_LIMITS.safeMaxRequestsPerWindow;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

  getNextAvailableTime(): number {
    if (this.canMakeRequest()) {
      return Date.now();
    }

    // Calculate when the oldest request will fall outside the window
    const oldestRequest = this.requests[0];
    return oldestRequest + RATE_LIMITS.windowSizeMs + 100; // Add small buffer
  }
}

// Export singleton rate limiter
export const rateLimiter = new RateLimiter();

/**
 * Best practices checklist for Suno API usage
 */
export const BEST_PRACTICES = {
  generation: [
    "Always validate parameters before sending to API",
    "Use customMode=true for better control over output",
    "Include negativeTags to avoid unwanted styles",
    "Set appropriate styleWeight based on how strict you want adherence",
    "Use V5 model for best expression in emotional music like carols",
    "Prefix prompts with [Verse], [Chorus], etc. for better structure",
  ],

  polling: [
    "Start polling after initial delay to avoid unnecessary requests",
    "Use progressive intervals - longer for early stages",
    "Implement timeout to avoid infinite polling",
    "Cache completed results to avoid re-fetching",
  ],

  errorHandling: [
    "Implement exponential backoff for retries",
    "Distinguish between retryable and non-retryable errors",
    "Provide user-friendly error messages",
    "Log all errors for monitoring and debugging",
    "Track success rates to identify issues early",
  ],

  performance: [
    "Batch status checks when possible",
    "Implement request queuing to respect rate limits",
    "Use webhooks (callbacks) instead of polling when possible",
    "Cache API responses appropriately",
    "Monitor API response times and success rates",
  ],
} as const;
