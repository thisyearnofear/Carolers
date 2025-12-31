import { NextResponse } from 'next/server';
import { getUserCarols } from '@/lib/user-carols';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'processing' | 'complete' | 'error' | null;

    const carols = await getUserCarols(userId, status ? { status } : undefined);

    return NextResponse.json(carols);
  } catch (error: any) {
    console.error('Error fetching user carols:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user carols' },
      { status: 500 }
    );
  }
}
