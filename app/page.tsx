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

      <PageClient>
        <section className="bg-primary/5 py-12 md:py-16 -mx-6 md:-mx-0">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-display text-primary mb-8 text-center">
              Jump In
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <a 
                href="/songs" 
                className="p-4 md:p-6 bg-white rounded-xl text-center hover:shadow-lg hover:scale-105 transition-all group"
              >
                <Music className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs md:text-sm font-bold text-slate-700">Browse Songs</span>
              </a>
              <button 
                onClick={() => document.dispatchEvent(new CustomEvent('openCreateEvent'))}
                className="p-4 md:p-6 bg-white rounded-xl text-center hover:shadow-lg hover:scale-105 transition-all group"
              >
                <Plus className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs md:text-sm font-bold text-slate-700">New Event</span>
              </button>
            </div>
          </div>
        </section>

        <Suspense fallback={
          <>
            {[...Array(3)].map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </>
        }>
          <EventList initialEvents={events} />
        </Suspense>
      </PageClient>
    </>
  );
}
// Trigger rebuild for event fetching Sat Dec 20 13:59:18 EAT 2025
