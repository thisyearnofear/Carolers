import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { messages } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const eventMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.eventId, id))
      .orderBy(messages.timestamp);
    return NextResponse.json(eventMessages);
  } catch (error) {
    console.error('Error fetching event messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const db = await getDb();
    const result = await db
      .insert(messages)
      .values({
        eventId: id,
        memberId: body.memberId,
        text: body.text
      });
    
    // MySQL doesn't support returning, so return the input data
    return NextResponse.json({
      eventId: id,
      memberId: body.memberId,
      text: body.text,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to add message:', error);
    return NextResponse.json(
      { error: 'Failed to add message' },
      { status: 500 }
    );
  }
}
