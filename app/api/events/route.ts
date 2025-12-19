import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createEvent as createEventLib, getEvents as getEventsLib } from '@/lib/events';

// Schema validation
const createEventSchema = z.object({
  name: z.string().min(1),
  date: z.string().datetime(),
  theme: z.string().min(1),
  venue: z.string().optional(),
  description: z.string().min(1),
  createdBy: z.string().min(1),
});

export async function GET() {
  try {
    const events = await getEventsLib();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createEventSchema.parse(body);

    // Convert date string to Date object since the schema expects datetime string
    const eventData = {
      ...validatedData,
      date: new Date(validatedData.date)
    };

    const newEvent = await createEventLib(eventData);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}