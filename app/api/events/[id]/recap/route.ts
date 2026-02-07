import { NextResponse } from 'next/server';
import { getEvent } from '@/lib/events';
import { getCarols } from '@/lib/carols';
import { generateEventRecap } from '@/lib/ai';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const event = await getEvent(id);

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // Get carols and filter by event
        const allCarols = await getCarols();
        const eventCarols = event.carols
            ?.map((carolId: string) => allCarols.find(c => c.id === carolId))
            .filter((c): c is any => c !== undefined)
            .sort((a: any, b: any) => (b.votes || 0) - (a.votes || 0))
            .slice(0, 3) || [];

        const magicRecap = await generateEventRecap(event, eventCarols);

        return NextResponse.json({ magicRecap });
    } catch (error) {
        console.error('Error generating event recap:', error);
        return NextResponse.json(
            { error: 'Failed to generate recap' },
            { status: 500 }
        );
    }
}
