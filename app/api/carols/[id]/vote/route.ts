import { NextResponse } from 'next/server';
import { voteForCarol } from '@/lib/carols';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await voteForCarol(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error voting for carol:', error);
    return NextResponse.json(
      { error: 'Failed to vote for carol' },
      { status: 500 }
    );
  }
}