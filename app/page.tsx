import { Suspense } from 'react';
import { EventCardSkeleton } from './components/event/event-card-skeleton';
import { PageClient } from './page-client';
import { EventList } from './components/event/event-list';
import { Music, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

import { getEvents } from '@/lib/events';

export default async function HomePage() {
  const events = await getEvents();

  return (
    <>
      <section className="relative">
        <div className="h-[28vh] md:h-[40vh] lg:h-[56vh] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/carolersbanner.png')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-white/70" />
          <div className="relative container mx-auto px-6 h-full flex items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-display text-primary mb-4 drop-shadow-sm">Join the Festive Chorus</h1>
              <p className="text-slate-700 text-lg md:text-xl mb-6">Plan carol events with friends, vote on songs, and share the joy of the season.</p>
              <a href="/songs" className="inline-flex items-center px-6 h-12 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">Explore Songbook</a>
            </div>
          </div>
        </div>
      </section>

      <PageClient events={events}>
      </PageClient>
    </>
  );
}
// Trigger rebuild for event fetching Sat Dec 20 13:59:18 EAT 2025
