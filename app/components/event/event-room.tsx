'use client';

import { useState } from 'react';
import { type Event } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CarolPlayer } from '../carl-player';
import { EventDetails } from './event-details';
import { EventContributions } from './event-contributions';
import { EventMessages } from './event-messages';

interface EventRoomProps {
  event: Event;
}

export function EventRoom({ event }: EventRoomProps) {
  const [activeTab, setActiveTab] = useState('details');

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{event.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="contributions">Contributions</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-4">
              <EventDetails event={event} />
              <div className="mt-6">
                <CarolPlayer event={event} />
              </div>
            </TabsContent>
            
            <TabsContent value="contributions" className="mt-4">
              <EventContributions eventId={event.id} />
            </TabsContent>
            
            <TabsContent value="messages" className="mt-4">
              <EventMessages eventId={event.id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}