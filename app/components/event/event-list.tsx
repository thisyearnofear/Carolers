'use client';

import { useState } from 'react';
import { EventCard } from './event-card';
import { type Event } from '@shared/schema';

interface EventListProps {
  initialEvents: Event[];
}

export function EventList({ initialEvents }: EventListProps) {
  const [events] = useState<Event[]>(initialEvents);

  return (
    <>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </>
  );
}