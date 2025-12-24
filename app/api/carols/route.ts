import { NextResponse } from 'next/server';
import { getCarols } from '@/lib/carols';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const query = searchParams.get('q') || undefined;
    const mood = searchParams.get('mood') || undefined;
    const energy = searchParams.get('energy') || undefined;

    const carols = await getCarols({ lang, query, mood, energy });
    return NextResponse.json(carols);
  } catch (error) {
    console.error('Error fetching carols:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carols' },
      { status: 500 }
    );
  }
}