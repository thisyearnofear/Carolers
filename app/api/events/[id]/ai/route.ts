import { NextRequest, NextResponse } from 'next/server';
import { getEvent } from '@/lib/events';
import { addMessage } from '@/lib/messages';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { callGeminiWithTools } from '@/lib/ai';

// Simple in-memory rate limiting
const rateLimits = new Map<string, { count: number; lastReset: number }>();

function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const window = 60 * 1000; // 1 minute
  const maxRequests = 10; // 10 requests per minute (increased for function calling)
  
  if (!rateLimits.has(userId)) {
    rateLimits.set(userId, { count: 1, lastReset: now });
    return { allowed: true };
  }
  
  const userData = rateLimits.get(userId)!;
  
  // Reset if window has passed
  if (now - userData.lastReset > window) {
    rateLimits.set(userId, { count: 1, lastReset: now });
    return { allowed: true };
  }
  
  // Check if limit exceeded
  if (userData.count >= maxRequests) {
    const retryAfter = window - (now - userData.lastReset);
    return { allowed: false, retryAfter: Math.ceil(retryAfter / 1000) };
  }
  
  // Increment count
  userData.count++;
  return { allowed: true };
}

// AI Request Schema
const aiRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty'),
  settings: z.object({
    provider: z.string().optional(),
    geminiKey: z.string().nullable().optional(),
    veniceKey: z.string().nullable().optional(),
    useGemini3: z.boolean().optional()
  }).optional()
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    
    // ... authentication and rate limit logic (kept same)

    // Validate request
    const jsonBody = await request.json();
    const body = aiRequestSchema.parse(jsonBody);
    const { prompt, settings } = body;

    // Extract options from settings provided by frontend
    const options = {
      provider: settings?.provider || 'gemini',
      userKey: settings?.provider === 'venice' ? settings?.veniceKey : settings?.geminiKey,
      useGemini3: settings?.useGemini3 || false
    };

    // Call Gemini with function calling
    const { response, toolCalls } = await callGeminiWithTools(
      prompt,
      id,
      event.theme,
      options
    );

    // Add AI response as message
    await addMessage({
      eventId: id,
      memberId: userId,
      text: response,
      type: 'ai',
      payload: toolCalls.length > 0 ? { toolCalls } : undefined
    });

    return NextResponse.json({
      success: true,
      response,
      toolCalls: toolCalls.map(tc => ({
        tool: tc.tool,
        args: tc.args,
        result: tc.result
      }))
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error processing AI request:', error);
    
    // Return meaningful error to client
    const errorMessage = error instanceof Error ? error.message : 'Failed to process AI request';
    return NextResponse.json(
      { error: 'Failed to process AI request', details: errorMessage },
      { status: 500 }
    );
  }
}
