import { notFound } from 'next/navigation';
import { EventRoom } from '../../components/event/event-room';
import { getEvent } from '@/lib/events';

export default async function EventPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);
  
  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100">
      <EventRoom event={event} />
    </div>
  );
}