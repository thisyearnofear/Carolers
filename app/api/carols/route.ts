import { NextResponse } from 'next/server';
import { getCarols } from '@/lib/carols';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const carols = await getCarols(lang);
    return NextResponse.json(carols);
  } catch (error) {
    console.error('Error fetching carols:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carols' },
      { status: 500 }
    );
  }
}