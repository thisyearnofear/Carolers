import { NextResponse } from 'next/server';
import { z } from 'zod';
import { addMessage } from '@/lib/messages';

const messageSchema = z.object({
  eventId: z.string(),
  memberId: z.string(),
  text: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = messageSchema.parse(body);

    const newMessage = await addMessage(validatedData);
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error adding message:', error);
    return NextResponse.json(
      { error: 'Failed to add message' },
      { status: 500 }
    );
  }
}