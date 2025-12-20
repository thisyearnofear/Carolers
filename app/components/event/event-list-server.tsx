import { EventList } from './event-list';
import { getEvents } from '@/lib/events';

export async function EventListServer() {
  try {
    const events = await getEvents();
    return <EventList initialEvents={events} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('EventListServer error:', message);
    
    // Return empty list - page renders even if database is unavailable
    // This is better UX for serverless where connections can be transient
    return <EventList initialEvents={[]} />;
  }
}
