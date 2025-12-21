import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { carols } from '@shared/schema';

export async function GET() {
  try {
    const db = await getDb();
    // Simple connectivity check
    await db.execute("SELECT 1");

    // Optional: check carols table exists and count rows
    let carolsCount: number | null = null;
    try {
      const rows = await db.select({ id: carols.id }).from(carols);
      carolsCount = rows.length;
    } catch (_) {
      // table may not exist yet
      carolsCount = null;
    }

    return NextResponse.json({ ok: true, carolsCount });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
