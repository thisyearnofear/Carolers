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
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    
    // Authentication check
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting check
    const rateLimitResult = checkRateLimit(userId);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter,
          message: `Please wait ${rateLimitResult.retryAfter} seconds before making another request.`
        },
        { status: 429 }
      );
    }

    // Validate event exists and user is a member
    const event = await getEvent(id);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!event.members?.includes(userId)) {
      return NextResponse.json(
        { error: 'User not a member of this event' },
        { status: 403 }
      );
    }

    // Validate request
    const body = await request.json();
    const { prompt } = aiRequestSchema.parse(body);

    // Call Gemini with function calling
    const { response, toolCalls } = await callGeminiWithTools(
      prompt,
      id,
      event.theme
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
