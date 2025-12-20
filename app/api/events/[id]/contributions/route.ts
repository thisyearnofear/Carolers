import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { contributions } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const eventContributions = await db
      .select()
      .from(contributions)
      .where(eq(contributions.eventId, id));
    
    return NextResponse.json(eventContributions);
  } catch (error) {
    console.error('Failed to fetch contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
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
    
    // memberId should be provided by the client (from Clerk authentication)
    if (!body.memberId) {
      return NextResponse.json(
        { error: 'memberId is required' },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    const result = await db
      .insert(contributions)
      .values({
        eventId: id,
        memberId: body.memberId,
        item: body.item,
        status: body.status || 'proposed'
      });
    
    // MySQL doesn't support returning, so return the input data
    return NextResponse.json({
      eventId: id,
      memberId: body.memberId,
      item: body.item,
      status: body.status || 'proposed'
    });
  } catch (error) {
    console.error('Failed to add contribution:', error);
    return NextResponse.json(
      { error: 'Failed to add contribution' },
      { status: 500 }
    );
  }
}
