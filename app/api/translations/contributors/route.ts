import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import {
  getOrCreateReputation,
  getLeaderboard,
} from '@/lib/translations';

const leaderboardSchema = z.object({
  language: z.string().min(1).max(10),
  limit: z.coerce.number().min(1).max(100).optional(),
});

const reputationSchema = z.object({
  language: z.string().min(1).max(10),
});

/**
 * GET /api/translations/contributors?language=es&limit=10
 * Get reputation leaderboard for a language
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const language = searchParams.get('language') || 'en';
    const limitStr = searchParams.get('limit') || '10';
    const limit = Math.min(parseInt(limitStr), 100);

    const leaderboard = await getLeaderboard(language, limit);

    return NextResponse.json({
      success: true,
      language,
      leaderboard,
      count: leaderboard.length,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/translations/contributors
 * Get current user's reputation (returns 0 if not yet contributed)
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
    const { language } = reputationSchema.parse(body);

    const reputation = await getOrCreateReputation(userId, language);

    return NextResponse.json({
      success: true,
      reputation,
      votingPower: 1 + Math.floor((reputation.repPoints || 0) / 100),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching user reputation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reputation' },
      { status: 500 }
    );
  }
}
