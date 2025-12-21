import { NextRequest, NextResponse } from 'next/server';
import { getEvent } from '@/lib/events';
import { getEventMessages } from '@/lib/messages';
import { addMessage } from '@/lib/messages';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { callGeminiAI, generateCarolSuggestions } from '@/lib/ai';

// Simple in-memory rate limiting (for demo purposes)
// In production, use Redis or similar
const rateLimits = new Map<string, { count: number, lastReset: number }>();

function checkRateLimit(userId: string): { allowed: boolean, retryAfter?: number } {
  const now = Date.now();
  const window = 60 * 1000; // 1 minute window
  const maxRequests = 5; // 5 requests per minute
  
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
  prompt: z.string().min(1),
  tool: z.enum(['searchCarols', 'addContribution', 'summarizeChat', 'suggestSetlist']).optional(),
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

    const body = await request.json();
    const { prompt, tool } = aiRequestSchema.parse(body);

    // For now, implement a simple mock response
    // In production, this would call the actual Gemini API
    let aiResponse = '';
    let messageType: 'ai' = 'ai';
    let payload = null;

    // Handle different tools
    if (tool === 'searchCarols') {
      // Use AI to search for carols
      const aiResult = await callGeminiAI(prompt, id, 'searchCarols', event.theme);
      aiResponse = aiResult.response;
      
      if (aiResult.payload) {
        payload = aiResult.payload;
      } else {
        // Fallback to mock if AI doesn't provide payload
        const mockCarols = [
          { title: 'Silent Night', artist: 'Traditional' },
          { title: 'Joy to the World', artist: 'Traditional' },
          { title: 'O Holy Night', artist: 'Adolphe Adam' }
        ];
        payload = { tool: 'searchCarols', results: mockCarols };
      }
    } else if (tool === 'summarizeChat') {
      // Use AI to summarize chat
      const aiResult = await callGeminiAI(`Summarize the recent chat activity for this event: ${prompt}`, id, 'summarizeChat', event.theme);
      aiResponse = aiResult.response;
      
      if (aiResult.payload) {
        payload = aiResult.payload;
      } else {
        // Fallback to simple summary
        const messages = await getEventMessages(id);
        const recentMessages = messages.slice(-5);
        payload = { 
          tool: 'summarizeChat',
          summary: recentMessages.map(m => `• ${(m as any).userName || 'Someone'}: ${m.text}`).join('\n'),
          messageCount: recentMessages.length
        };
      }
    } else if (tool === 'suggestSetlist') {
      // Use AI to suggest setlist
      const setlist = await generateCarolSuggestions(event.theme || 'Christmas', 5);
      aiResponse = `Here's a suggested setlist for your "${event.theme}" themed event:\n\n${setlist.map((song, i) => `${i+1}. ${song}`).join('\n')}`;
      payload = { tool: 'suggestSetlist', setlist };
    } else if (tool === 'addContribution') {
      // Use AI to suggest contributions
      const aiResult = await callGeminiAI(`Suggest contributions for: ${prompt}`, id, 'addContribution', event.theme);
      aiResponse = aiResult.response;
      
      if (aiResult.payload) {
        payload = aiResult.payload;
      } else {
        // Fallback suggestions
        const mockContributions = [
          { item: 'Snacks and drinks', category: 'Food' },
          { item: 'Extra sheet music', category: 'Music' },
          { item: 'Portable speaker', category: 'Equipment' }
        ];
        payload = { tool: 'addContribution', suggestions: mockContributions };
      }
    } else {
      // General AI response using Gemini
      const aiResult = await callGeminiAI(prompt, id, undefined, event.theme);
      aiResponse = aiResult.response;
      
      if (aiResult.toolUsed) {
        payload = { toolUsed: aiResult.toolUsed };
      }
    }

    // Add the AI response as a message
    await addMessage({
      eventId: id,
      memberId: userId,
      text: aiResponse,
      type: messageType,
      payload: payload
    });

    return NextResponse.json({
      success: true,
      response: aiResponse,
      messageType,
      payload
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error processing AI request:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}