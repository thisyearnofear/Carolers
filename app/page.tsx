'use client';

import { Suspense, useState } from 'react';
import { EventListServer } from './components/event/event-list-server';
import { EventCardSkeleton } from './components/event/event-card-skeleton';
import { CreateEventModal } from './components/modals/create-event-modal';
import { JoinEventModal } from './components/modals/join-event-modal';
import { Button } from './components/ui/button';
import { Plus, Users } from 'lucide-react';

export default function HomePage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-sky-800 mb-2">Carolers</h1>
          <p className="text-lg text-sky-600 mb-6">Join festive caroling events near you</p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </Button>
            <Button 
              onClick={() => setShowJoinModal(true)}
              variant="outline"
              size="lg"
            >
              <Users className="w-5 h-5 mr-2" />
              Join Existing
            </Button>
          </div>
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
      
      <CreateEventModal 
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
      <JoinEventModal 
        open={showJoinModal}
        onOpenChange={setShowJoinModal}
      />
    </div>
  );
}
