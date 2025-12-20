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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-50 via-white to-green-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950/20">
      <EventRoom event={event} />
    </div>
  );
}