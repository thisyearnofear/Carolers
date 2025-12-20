import { EventList } from './event-list';
import { getEvents } from '@/lib/events';

export async function EventListServer() {
  try {
    const events = await getEvents();
    return <EventList initialEvents={events} />;
  } catch (error) {
    console.error('EventListServer error:', error instanceof Error ? error.message : error);
    // Return empty list on error - allows page to render even if DB is down
    return <EventList initialEvents={[]} />;
  }
}
