import { NextResponse } from 'next/server';
import { z } from 'zod';
import { addContribution } from '@/lib/contributions';

const contributionSchema = z.object({
  eventId: z.string(),
  memberId: z.string(),
  item: z.string().min(1),
  status: z.enum(['proposed', 'confirmed', 'brought']).default('proposed'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = contributionSchema.parse(body);

    const newContribution = await addContribution(validatedData);
    return NextResponse.json(newContribution, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error adding contribution:', error);
    return NextResponse.json(
      { error: 'Failed to add contribution' },
      { status: 500 }
    );
  }
}