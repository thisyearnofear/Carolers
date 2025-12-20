import { Suspense } from 'react';
import { EventCardSkeleton } from './components/event/event-card-skeleton';
import { PageClient } from './page-client';
import { EventList } from './components/event/event-list';

export const dynamic = 'force-dynamic';

import { getEvents } from '@/lib/events';

export default async function HomePage() {
  const events = await getEvents();

  return (
    <PageClient>
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
  );
}
// Trigger rebuild for event fetching Sat Dec 20 13:59:18 EAT 2025
