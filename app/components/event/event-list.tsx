'use client';

import { useState } from 'react';
import { EventCard } from './event-card';
import { type Event } from '@shared/schema';
import { motion } from 'framer-motion';

interface EventListProps {
  initialEvents: Event[];
}

export function EventList({ initialEvents }: EventListProps) {
  const [events] = useState<Event[]>(initialEvents);

  if (events.length === 0) {
    return (
      <div className="col-span-full text-center py-20 bg-white/30 backdrop-blur-sm rounded-3xl border-2 border-dashed border-primary/20">
        <h3 className="font-display text-3xl text-primary mb-2">No events yet! 🎄</h3>
        <p className="text-secondary-foreground/60">Be the first to start a caroling group in your area.</p>
      </div>
    );
  }

  return (
    <>
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <EventCard event={event} />
        </motion.div>
      ))}
    </>
  );
}