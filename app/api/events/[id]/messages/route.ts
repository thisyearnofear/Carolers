import { NextResponse } from 'next/server';
import { getEventMessages } from '@/lib/messages';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const messages = await getEventMessages(params.id);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching event messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}