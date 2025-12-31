import { NextResponse } from 'next/server';
import { getTrendingUserCarols, getNewUserCarols, getAllUserCarols } from '@/lib/carol-queries';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'trending'; // trending | new | all
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50); // Cap at 50

    let carols;

    switch (sort) {
      case 'new':
        carols = await getNewUserCarols(limit);
        break;
      case 'all':
        carols = await getAllUserCarols(limit);
        break;
      case 'trending':
      default:
        carols = await getTrendingUserCarols(limit);
        break;
    }

    return NextResponse.json(carols);
  } catch (error) {
    console.error('Error fetching carols:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carols' },
      { status: 500 }
    );
  }
}
