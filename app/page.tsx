import { Suspense } from 'react';
import { EventListServer } from './components/event/event-list-server';
import { EventCardSkeleton } from './components/event/event-card-skeleton';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-sky-800 mb-2">Carolers</h1>
          <p className="text-lg text-sky-600">Join festive caroling events near you</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Suspense fallback={
            <>
              {[...Array(3)].map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </>
          }>
            <EventListServer />
          </Suspense>
        </div>
      </div>
    </div>
  );
}