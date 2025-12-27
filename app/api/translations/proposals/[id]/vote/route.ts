import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { voteOnProposal } from '@/lib/translations';

const voteSchema = z.object({
  vote: z.enum(['upvote', 'downvote']),
});

/**
 * POST /api/translations/proposals/[id]/vote
 * Vote on a translation proposal (upvote or downvote)
 * Reputation-weighted voting power is calculated server-side
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { vote } = voteSchema.parse(body);

    // Convert vote string to number
    const voteValue: -1 | 1 = vote === 'upvote' ? 1 : -1;

    // Record vote
    await voteOnProposal(id, userId, voteValue);

    return NextResponse.json({
      success: true,
      message: `Your ${vote} has been recorded`,
      vote: voteValue,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    // Check for duplicate vote error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('already voted')) {
      return NextResponse.json(
        { error: 'You have already voted on this proposal' },
        { status: 409 }
      );
    }

    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}
