'use client';

import { useMemo } from 'react';
import { EventCard } from './event-card';
import { type Event } from '@shared/schema';
import { EmptyState } from '../empty-state';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

interface EventListProps {
  initialEvents: Event[];
}

function EventGrid({ events, startIndex = 0 }: { events: Event[]; startIndex?: number }) {
  return (
    <ul className="list-none grid grid-cols-1 md:grid-cols-2 gap-6" role="list">
      {events.map((event, index) => (
        <li key={event.id}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (startIndex + index) * 0.1 }}
          >
            <EventCard event={event} />
          </motion.div>
        </li>
      ))}
    </ul>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="h-px bg-primary/10 flex-1" />
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">{label}</h3>
      <div className="h-px bg-primary/10 flex-1" />
    </div>
  );
}

export function EventList({ initialEvents }: EventListProps) {
  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const up: Event[] = [];
    const p: Event[] = [];
    for (const event of initialEvents) {
      (new Date(event.date) < now ? p : up).push(event);
    }
    up.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    p.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { upcoming: up, past: p };
  }, [initialEvents]);

  if (upcoming.length === 0 && past.length === 0) {
    return (
      <EmptyState
        icon={<Music className="w-16 h-16" />}
        title="No sessions yet"
        description="Be the first to start a caroling session and spread some holiday magic!"
      />
    );
  }

  return (
    <section aria-label="Caroling sessions" role="region" className="container mx-auto px-4 md:px-6 py-8 col-span-full">
      {upcoming.length > 0 && (
        <div className="mb-10">
          <SectionHeader label="Upcoming" />
          <EventGrid events={upcoming} />
        </div>
      )}
      {past.length > 0 && (
        <div>
          <SectionHeader label="Past" />
          <EventGrid events={past} startIndex={upcoming.length} />
        </div>
      )}
    </section>
  );
}