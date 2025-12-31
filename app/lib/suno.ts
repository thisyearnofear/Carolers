import 'server-only';

const SUNO_API_BASE = 'https://api.sunoapi.org/api';
const SUNO_API_KEY = process.env.SUNO_API_KEY;

export interface SunoGenerateRequest {
  title: string;
  lyrics?: string;
  genre?: string;
  style?: string;
  custom_mode?: boolean;
}

export interface SunoGenerateResponse {
  success: boolean;
  code: string;
  data: {
    clips: Array<{
      id: string;
      video_url: string;
      audio_url: string;
      image_url: string;
      title: string;
      status: 'processing' | 'complete' | 'error';
      error_message?: string;
    }>;
  };
}

export interface SunoStatusResponse {
  success: boolean;
  code: string;
  data: Array<{
    id: string;
    video_url: string;
    audio_url: string;
    image_url: string;
    title: string;
    status: 'processing' | 'complete' | 'error';
    error_message?: string;
  }>;
}

async function callSunoAPI(
  endpoint: string,
  method: 'GET' | 'POST',
  body?: Record<string, any>
) {
  if (!SUNO_API_KEY) {
    throw new Error('SUNO_API_KEY environment variable not set');
  }

  const url = `${SUNO_API_BASE}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${SUNO_API_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  if (body && method === 'POST') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Suno API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Generate a new carol using Suno API
 * Returns job IDs for polling
 */
export async function generateCarol(params: SunoGenerateRequest) {
  const response = await callSunoAPI(
    '/generate',
    'POST',
    {
      title: params.title,
      lyrics: params.lyrics,
      genre: params.genre || 'Christmas',
      style: params.style || 'Traditional',
      custom_mode: params.custom_mode ?? true,
    }
  ) as SunoGenerateResponse;

  if (!response.success) {
    throw new Error(`Failed to generate carol: ${response.code}`);
  }

  return response.data.clips;
}

/**
 * Poll for carol generation status
 */
export async function getCarolStatus(jobIds: string | string[]) {
  const ids = Array.isArray(jobIds) ? jobIds : [jobIds];
  const queryString = ids.join(',');

  const response = await callSunoAPI(
    `/get_music?ids=${queryString}`,
    'GET'
  ) as SunoStatusResponse;

  if (!response.success) {
    throw new Error(`Failed to get carol status: ${response.code}`);
  }

  return response.data;
}

/**
 * Check if a carol generation is complete
 */
export async function isCarolReady(jobId: string): Promise<boolean> {
  try {
    const status = await getCarolStatus(jobId);
    if (status.length === 0) return false;
    
    const clip = status[0];
    if (clip.status === 'error') {
      throw new Error(clip.error_message || 'Carol generation failed');
    }
    
    return clip.status === 'complete';
  } catch (error) {
    console.error('Error checking carol status:', error);
    throw error;
  }
}

/**
 * Get completed carol with audio/video URLs
 */
export async function getCompletedCarol(jobId: string) {
  const status = await getCarolStatus(jobId);
  if (status.length === 0) {
    throw new Error('Carol not found');
  }

  const clip = status[0];
  
  if (clip.status === 'error') {
    throw new Error(clip.error_message || 'Carol generation failed');
  }

  if (clip.status !== 'complete') {
    throw new Error('Carol is still generating');
  }

  return {
    id: clip.id,
    audioUrl: clip.audio_url,
    videoUrl: clip.video_url,
    imageUrl: clip.image_url,
    title: clip.title,
  };
}
