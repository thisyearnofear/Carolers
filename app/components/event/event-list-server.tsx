import { EventList } from './event-list';
import { getEvents } from '@/lib/events';

export async function EventListServer() {
  try {
    const events = await getEvents();
    return <EventList initialEvents={events} />;
  } catch (error) {
    console.error('EventListServer error:', error);
    // Return empty list on error instead of crashing
    return <EventList initialEvents={[]} />;
  }
}