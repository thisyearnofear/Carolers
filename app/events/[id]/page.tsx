import { notFound } from 'next/navigation';
import { EventRoom } from '../../components/event/event-room';
import { getEvent } from '@/lib/events';

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  
  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100">
      <EventRoom event={event} />
    </div>
  );
}