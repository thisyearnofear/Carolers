'use client';

import { useState } from 'react';
import { EventCard } from './event-card';
import { type Event } from '@shared/schema';
import { EmptyState } from '../empty-state';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

interface EventListProps {
  initialEvents: Event[];
}

export function EventList({ initialEvents }: EventListProps) {
  const [events] = useState<Event[]>(initialEvents);

  if (events.length === 0) {
    return (
      <EmptyState
        icon={<Music className="w-16 h-16" />}
        title="No active sessions"
        description="Be the first to start a caroling session and spread some holiday magic!"
      />
    );
  }

  return (
    <section aria-label="Available caroling sessions" role="region">
      <ul className="list-none" role="list">
        {events.map((event, index) => (
          <li key={event.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <EventCard event={event} />
            </motion.div>
          </li>
        ))}
      </ul>
    </section>
  );
}