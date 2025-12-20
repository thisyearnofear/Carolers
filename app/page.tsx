import { Suspense } from 'react';
import { EventListServer } from './components/event/event-list-server';
import { EventCardSkeleton } from './components/event/event-card-skeleton';
import { PageClient } from './page-client';

export default function HomePage() {
  return (
    <PageClient>
      <Suspense fallback={
        <>
          {[...Array(3)].map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </>
      }>
        <EventListServer />
      </Suspense>
    </PageClient>
  );
}
