'use client';

import { useState } from 'react';
import { EventCard } from './event-card';
import { type Event } from '@shared/schema';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

interface EventListProps {
  initialEvents: Event[];
}

export function EventList({ initialEvents }: EventListProps) {
  const [events] = useState<Event[]>(initialEvents);

  if (events.length === 0) {
    return (
      <div className="col-span-full text-center py-16 px-6 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-primary/10 shadow-inner">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
          <Music className="w-8 h-8" />
        </div>
        <h3 className="font-display text-2xl text-primary mb-2">No active sessions</h3>
        <p className="text-slate-800 font-medium max-w-[240px] mx-auto leading-relaxed">
          Be the first to start a caroling session and spread some holiday magic!
        </p>
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