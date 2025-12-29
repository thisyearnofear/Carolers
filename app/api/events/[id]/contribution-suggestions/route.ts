import { NextRequest, NextResponse } from 'next/server';
import { getEvent } from '@/lib/events';
import { auth } from '@clerk/nextjs/server';
import { generateText } from '@/lib/ai';

interface ContributionSuggestion {
  category: string;
  items: string[];
  reasoning: string;
}

export async function GET(
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

    // Generate suggestions using Gemini
    const prompt = `You are an expert Christmas caroling event coordinator.
Given this event context, suggest specific items the team should contribute.

Event Name: ${event.name}
Theme: ${event.theme || 'Christmas'}
Venue: ${event.venue || 'Unknown'}
Attendees: ${event.members?.length || 0} singers
Date: ${new Date(event.date).toLocaleDateString()}

Provide practical, specific contribution suggestions organized by category.
Think about what's needed for a successful caroling event: food, music equipment, logistics, decorations, etc.

Format as JSON with this structure:
{
  "suggestions": [
    {
      "category": "Food & Beverages",
      "items": ["Hot chocolate", "Cookies", "Hand warmers"],
      "reasoning": "Keep singers warm and energized during outdoor caroling"
    },
    {
      "category": "Music Equipment",
      "items": ["Portable speaker", "Song sheets (printed)"],
      "reasoning": "Backup for acoustic singing and helps harmony"
    }
  ]
}

Only return valid JSON, no other text.`;

    const responseText = await generateText(prompt);

    // Parse JSON response
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Fallback suggestions if parsing fails
      parsed = {
        suggestions: [
          {
            category: 'Food & Beverages',
            items: ['Hot chocolate', 'Cookies', 'Hot cider'],
            reasoning: 'Keep singers warm and energized'
          },
          {
            category: 'Music Equipment',
            items: ['Portable speaker', 'Extra song sheets'],
            reasoning: 'Support backup instruments and song visibility'
          },
          {
            category: 'Logistics',
            items: ['Transportation', 'Warm blankets'],
            reasoning: 'Ensure comfort and safe travel'
          }
        ]
      };
    }

    return NextResponse.json({
      success: true,
      suggestions: parsed.suggestions || []
    });

  } catch (error) {
    console.error('Error generating contribution suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
