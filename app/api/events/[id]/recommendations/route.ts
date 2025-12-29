import { NextRequest, NextResponse } from 'next/server';
import { getEvent } from '@/lib/events';
import { auth } from '@clerk/nextjs/server';
import { getNextCarolRecommendations } from '@/lib/carol-recommendations';

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

    // Get request body
    const body = await request.json();
    const { recentCarolIds = [], limit = 3 } = body;

    // Get recommendations
    const recommendations = await getNextCarolRecommendations(
      id,
      event.theme || 'Christmas',
      recentCarolIds,
      limit
    );

    return NextResponse.json({
      success: true,
      recommendations
    });

  } catch (error) {
    console.error('Error getting carol recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
