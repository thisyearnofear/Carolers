import "server-only";

const SUNO_API_BASE = "https://api.sunoapi.org/api/v1";
const SUNO_API_KEY = process.env.SUNO_API_KEY;

export interface SunoGenerateRequest {
  title: string;
  lyrics?: string;
  genre?: string;
  style?: string;
  model?: string;
  instrumental?: boolean;
  vocalGender?: "m" | "f";
  styleWeight?: number;
  weirdnessConstraint?: number;
  negativeTags?: string;
  customMode?: boolean;
}

export interface SunoGenerateResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface SunoTaskDetail {
  id: string;
  audioUrl: string;
  streamAudioUrl: string;
  imageUrl: string;
  prompt: string;
  modelName: string;
  title: string;
  tags: string;
  createTime: string;
  duration: number;
}

export interface SunoStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    parentMusicId: string;
    param: string;
    response: {
      taskId: string;
      sunoData: SunoTaskDetail[];
    };
    status:
      | "PENDING"
      | "TEXT_SUCCESS"
      | "FIRST_SUCCESS"
      | "SUCCESS"
      | "CREATE_TASK_FAILED"
      | "GENERATE_AUDIO_FAILED"
      | "CALLBACK_EXCEPTION"
      | "SENSITIVE_WORD_ERROR";
    type: "GENERATE" | "EXTEND" | "COVER";
    errorCode: string | null;
    errorMessage: string | null;
  };
}

async function callSunoAPI(
  endpoint: string,
  method: "GET" | "POST",
  body?: Record<string, any>,
) {
  if (!SUNO_API_KEY) {
    throw new Error("SUNO_API_KEY environment variable not set");
  }

  const url = `${SUNO_API_BASE}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${SUNO_API_KEY}`,
      "Content-Type": "application/json",
    },
    // Add cache control to prevent stale status results
    cache: "no-store",
  };

  if (body && method === "POST") {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      // Provide specific error messages based on Suno API status codes
      switch (response.status) {
        case 400:
          throw new Error(
            `Invalid parameters: ${errorData.msg || errorData.message || "Check your request parameters"}`,
          );
        case 401:
        case 403:
          throw new Error(
            "Invalid Suno API key. Please check your SUNO_API_KEY environment variable.",
          );
        case 404:
          throw new Error(
            "Suno API endpoint not found. The API may have changed or the service is unavailable.",
          );
        case 405:
          throw new Error(
            "Rate limit exceeded. Suno allows 20 requests per 10 seconds. Please wait and try again.",
          );
        case 413:
          throw new Error(
            "Prompt or style text is too long. Please reduce the length and try again.",
          );
        case 429:
          throw new Error(
            "Insufficient credits. Check your Suno account balance.",
          );
        case 430:
          throw new Error(
            "Request frequency too high. Please wait a moment and try again.",
          );
        case 455:
          throw new Error(
            "Suno API is under maintenance. Please try again in a few moments.",
          );
        default:
          if (response.status >= 500) {
            throw new Error(
              "Suno API service is temporarily unavailable. Please try again later.",
            );
          }
          throw new Error(
            `Suno API error: ${response.status} - ${errorData.msg || errorData.message || errorText}`,
          );
      }
    }

    const data = await response.json();

    // Check for API-level errors even on 200 responses
    if (data.code && data.code !== 200) {
      throw new Error(`Suno API error: ${data.msg || "Unknown error"}`);
    }

    return data;
  } catch (error) {
    // Network errors or other fetch failures
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Network error: Unable to reach Suno API. Please check your internet connection.",
      );
    }
    throw error;
  }
}

/**
 * Generate a new carol using Suno API
 * Returns task ID for polling
 * Follows exact API documentation specifications
 */
export async function generateCarol(params: SunoGenerateRequest) {
  const isCustomMode = params.customMode ?? true;
  const isInstrumental = params.instrumental ?? false;

  const payload: any = {
    customMode: isCustomMode,
    instrumental: isInstrumental,
    model: params.model || "V5", // Default to V5 as recommended
    callBackUrl: process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/suno/callback`
      : undefined, // Only include if we have a public URL
  };

  // In custom mode, use exact field names from API docs
  if (isCustomMode) {
    // Required fields for custom mode
    payload.title = params.title;
    payload.style = params.style || "Traditional Christmas"; // Default style for carols

    // Prompt is required if not instrumental
    if (!isInstrumental) {
      payload.prompt = params.lyrics || params.title; // Prompt is used as exact lyrics
    }

    // Optional advanced parameters - only include if provided
    if (params.vocalGender) {
      payload.vocalGender = params.vocalGender;
    }
    if (params.styleWeight !== undefined) {
      // Ensure value is between 0 and 1, rounded to 2 decimal places
      payload.styleWeight =
        Math.round(Math.max(0, Math.min(1, params.styleWeight)) * 100) / 100;
    }
    if (params.weirdnessConstraint !== undefined) {
      // Ensure value is between 0 and 1, rounded to 2 decimal places
      payload.weirdnessConstraint =
        Math.round(Math.max(0, Math.min(1, params.weirdnessConstraint)) * 100) /
        100;
    }
    if (params.negativeTags) {
      payload.negativeTags = params.negativeTags;
    }
  } else {
    // In non-custom mode, only prompt is needed
    payload.prompt = params.title; // Use title as simple prompt
  }

  const response = (await callSunoAPI(
    "/generate",
    "POST",
    payload,
  )) as SunoGenerateResponse;

  if (!response.data?.taskId) {
    throw new Error("Failed to generate carol: No task ID returned");
  }

  return response.data.taskId;
}

/**
 * Poll for carol generation status
 * Uses the exact endpoint and response format from API docs
 */
export async function getCarolStatus(taskId: string) {
  const response = (await callSunoAPI(
    `/generate/record-info?taskId=${taskId}`,
    "GET",
  )) as SunoStatusResponse;

  if (!response.data) {
    throw new Error("Invalid response from Suno API");
  }

  return response.data;
}

/**
 * Check if a carol generation is complete
 * Returns true only when status is SUCCESS
 */
export async function isCarolReady(taskId: string): Promise<boolean> {
  try {
    const statusData = await getCarolStatus(taskId);

    // Check the main status field
    const status = statusData.status;

    // Handle error states
    if (
      status === "CREATE_TASK_FAILED" ||
      status === "GENERATE_AUDIO_FAILED" ||
      status === "CALLBACK_EXCEPTION" ||
      status === "SENSITIVE_WORD_ERROR"
    ) {
      throw new Error(
        statusData.errorMessage || `Carol generation failed: ${status}`,
      );
    }

    // Only SUCCESS means fully complete
    return status === "SUCCESS";
  } catch (error) {
    console.error("Error checking carol status:", error);
    throw error;
  }
}

/**
 * Get completed carol with audio/video URLs
 * Returns structured data with all available clips
 */
export async function getCompletedCarol(taskId: string) {
  const statusData = await getCarolStatus(taskId);

  // Verify the task is complete
  if (statusData.status !== "SUCCESS") {
    if (
      statusData.status === "CREATE_TASK_FAILED" ||
      statusData.status === "GENERATE_AUDIO_FAILED" ||
      statusData.status === "CALLBACK_EXCEPTION" ||
      statusData.status === "SENSITIVE_WORD_ERROR"
    ) {
      throw new Error(
        statusData.errorMessage ||
          `Carol generation failed: ${statusData.status}`,
      );
    }
    throw new Error(`Carol is still generating (status: ${statusData.status})`);
  }

  // Extract the suno data
  const sunoData = statusData.response?.sunoData || [];

  if (sunoData.length === 0) {
    throw new Error("No audio data available");
  }

  // Get the first track as primary (Suno typically generates 2)
  const primaryTrack = sunoData[0];

  return {
    id: primaryTrack.id,
    audioUrl: primaryTrack.audioUrl,
    videoUrl: primaryTrack.streamAudioUrl, // Stream URL can be used as video URL
    imageUrl: primaryTrack.imageUrl,
    title: primaryTrack.title,
    duration: primaryTrack.duration,
    tags: primaryTrack.tags,
    modelName: primaryTrack.modelName,
    createTime: primaryTrack.createTime,
    // Include all generated clips (usually 2)
    clips: sunoData.map((track) => ({
      id: track.id,
      audioUrl: track.audioUrl,
      videoUrl: track.streamAudioUrl,
      imageUrl: track.imageUrl,
      duration: track.duration,
    })),
  };
}

/**
 * Helper function to determine if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  const message = error?.message?.toLowerCase() || "";

  // Rate limiting errors are retryable after a delay
  if (
    message.includes("rate limit") ||
    message.includes("frequency too high")
  ) {
    return true;
  }

  // Maintenance errors might be retryable
  if (message.includes("maintenance")) {
    return true;
  }

  // Temporary unavailability
  if (message.includes("temporarily unavailable")) {
    return true;
  }

  // Network errors are often retryable
  if (message.includes("network error")) {
    return true;
  }

  return false;
}

/**
 * Get retry delay based on error type
 */
export function getRetryDelay(error: any, attemptNumber: number): number {
  const message = error?.message?.toLowerCase() || "";

  // Rate limit: wait longer (10-20 seconds)
  if (message.includes("rate limit")) {
    return 10000 + attemptNumber * 5000; // 10s, 15s, 20s, etc.
  }

  // Frequency too high: moderate wait (5-10 seconds)
  if (message.includes("frequency too high")) {
    return 5000 + attemptNumber * 2500; // 5s, 7.5s, 10s, etc.
  }

  // Default exponential backoff for other errors
  return Math.min(1000 * Math.pow(2, attemptNumber), 30000); // 1s, 2s, 4s... max 30s
}

/**
 * Validate generation parameters before sending to API
 */
export function validateGenerationParams(params: SunoGenerateRequest): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const model = params.model || "V5";

  // Import the model configs
  const modelLimits = {
    V5: { prompt: 5000, style: 1000, title: 100 },
    V4_5PLUS: { prompt: 5000, style: 1000, title: 100 },
    V4_5ALL: { prompt: 5000, style: 1000, title: 80 },
    V4_5: { prompt: 5000, style: 1000, title: 100 },
    V4: { prompt: 3000, style: 200, title: 80 },
  };

  const limits =
    modelLimits[model as keyof typeof modelLimits] || modelLimits.V5;

  // Title validation
  if (!params.title || params.title.trim().length === 0) {
    errors.push("Title is required");
  } else if (params.title.length > limits.title) {
    errors.push(
      `Title exceeds ${limits.title} character limit for model ${model}`,
    );
  }

  // Custom mode validations
  if (params.customMode !== false) {
    // Style validation (required in custom mode)
    if (params.style && params.style.length > limits.style) {
      errors.push(
        `Style exceeds ${limits.style} character limit for model ${model}`,
      );
    }

    // Prompt/lyrics validation (required if not instrumental)
    if (
      !params.instrumental &&
      params.lyrics &&
      params.lyrics.length > limits.prompt
    ) {
      errors.push(
        `Lyrics exceed ${limits.prompt} character limit for model ${model}`,
      );
    }
  } else {
    // Non-custom mode: prompt limit is 500
    if (params.title.length > 500) {
      errors.push(
        "In non-custom mode, prompt (title) must be under 500 characters",
      );
    }
  }

  // Validate numeric parameters
  if (params.styleWeight !== undefined) {
    if (params.styleWeight < 0 || params.styleWeight > 1) {
      errors.push("Style weight must be between 0 and 1");
    }
  }

  if (params.weirdnessConstraint !== undefined) {
    if (params.weirdnessConstraint < 0 || params.weirdnessConstraint > 1) {
      errors.push("Weirdness constraint must be between 0 and 1");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
