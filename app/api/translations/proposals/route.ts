import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import {
  createTranslationProposal,
  getPendingProposals,
} from '@/lib/translations';
import { type InsertTranslationProposal } from '@shared/schema';

const createProposalSchema = z.object({
  translationId: z.string().min(1),
  newTitle: z.string().optional(),
  newLyrics: z.array(z.string()).optional(),
  changeReason: z.string().min(5).max(500),
});

const listProposalsSchema = z.object({
  translationId: z.string().min(1),
});

/**
 * POST /api/translations/proposals
 * Create a new proposal to edit a translation
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { translationId, newTitle, newLyrics, changeReason } = 
      createProposalSchema.parse(body);

    if (!newTitle && !newLyrics) {
      return NextResponse.json(
        { error: 'At least one of newTitle or newLyrics must be provided' },
        { status: 400 }
      );
    }

    // Create proposal
    const proposal = await createTranslationProposal(
      translationId,
      userId,
      {
        newTitle: newTitle || undefined,
        newLyrics: newLyrics || undefined,
        changeReason,
        requiredQuorum: 5,
      } as Omit<InsertTranslationProposal, 'translationId' | 'proposedBy'>
    );

    return NextResponse.json({
      success: true,
      proposal,
      message: 'Proposal created. Community will vote over the next 7 days.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating proposal:', error);
    return NextResponse.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/translations/proposals?translationId=xxx
 * List pending proposals for a translation
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const translationId = searchParams.get('translationId');

    if (!translationId) {
      return NextResponse.json(
        { error: 'Missing translationId parameter' },
        { status: 400 }
      );
    }

    const proposals = await getPendingProposals(translationId);

    return NextResponse.json({
      success: true,
      proposals,
      count: proposals.length,
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}
