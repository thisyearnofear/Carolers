import { NextResponse } from 'next/server';
import { getEventContributions } from '@/lib/contributions';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contributions = await getEventContributions(params.id);
    return NextResponse.json(contributions);
  } catch (error) {
    console.error('Error fetching event contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}