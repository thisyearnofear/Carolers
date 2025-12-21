import { NextRequest, NextResponse } from 'next/server';
import { getEvent, addCarolToEvent, removeCarolFromEvent } from '@/lib/events';
import { getCarol } from '@/lib/carols';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const addCarolSchema = z.object({
  carolId: z.string().min(1),
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
    const { carolId } = addCarolSchema.parse(body);

    // Validate carol exists
    const carol = await getCarol(carolId);
    if (!carol) {
      return NextResponse.json(
        { error: 'Carol not found' },
        { status: 404 }
      );
    }

    // Add carol to event
    const result = await addCarolToEvent(id, carolId);

    return NextResponse.json({
      success: true,
      carol: {
        id: carol.id,
        title: carol.title,
        artist: carol.artist,
      },
      alreadyAdded: result.alreadyAdded || false
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error adding carol to event:', error);
    return NextResponse.json(
      { error: 'Failed to add carol to event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const carolId = searchParams.get('carolId');
    
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

    if (!carolId) {
      return NextResponse.json(
        { error: 'Carol ID is required' },
        { status: 400 }
      );
    }

    // Remove carol from event
    await removeCarolFromEvent(id, carolId);

    return NextResponse.json({
      success: true,
      carolId
    });

  } catch (error) {
    console.error('Error removing carol from event:', error);
    return NextResponse.json(
      { error: 'Failed to remove carol from event' },
      { status: 500 }
    );
  }
}