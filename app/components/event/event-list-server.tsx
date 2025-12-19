import { EventList } from './event-list';
import { getEvents } from '@/lib/events';

export async function EventListServer() {
  const events = await getEvents();
  
  return <EventList initialEvents={events} />;
}