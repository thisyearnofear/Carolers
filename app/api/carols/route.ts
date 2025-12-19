import { NextResponse } from 'next/server';
import { getCarols } from '@/lib/carols';

export async function GET() {
  try {
    const carols = await getCarols();
    return NextResponse.json(carols);
  } catch (error) {
    console.error('Error fetching carols:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carols' },
      { status: 500 }
    );
  }
}