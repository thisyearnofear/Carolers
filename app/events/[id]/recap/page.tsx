import { notFound } from 'next/navigation';
import { getEvent } from '@/lib/events';
import { EventRecap } from '@/components/event/event-recap';

export default async function RecapPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) {
        notFound();
    }

    // Optional: Check if the event date has passed
    // const isPast = new Date(event.date) < new Date();

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-50 via-white to-orange-50/20 py-8">
            <EventRecap event={event} />
        </div>
    );
}
