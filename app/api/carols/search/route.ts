import { NextRequest, NextResponse } from 'next/server';
import { searchCarols } from '@/lib/carols';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(20).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = searchParams.get('limit');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const parsedLimit = limit ? parseInt(limit) : 5;
    const results = await searchCarols(query, parsedLimit);

    return NextResponse.json(results);

  } catch (error) {
    console.error('Error searching carols:', error);
    return NextResponse.json(
      { error: 'Failed to search carols' },
      { status: 500 }
    );
  }
}