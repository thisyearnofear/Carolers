import { NextRequest, NextResponse } from 'next/server';
import { voteForCarol } from '@/lib/carols';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await voteForCarol(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error voting for carol:', error);
    return NextResponse.json(
      { error: 'Failed to vote for carol' },
      { status: 500 }
    );
  }
}
