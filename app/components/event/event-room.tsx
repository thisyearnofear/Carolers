'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Event } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CarolPlayer } from '../carl-player';
import { EventDetails } from './event-details';
import { EventContributions } from './event-contributions';
import { EventMessages } from './event-messages';
import { Music, Calendar, Users, MessageSquare, Info } from 'lucide-react';

interface EventRoomProps {
  event: Event;
}

export function EventRoom({ event }: EventRoomProps) {
  const [activeTab, setActiveTab] = useState('details');

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 group">
          <div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4"
            >
              <Music className="w-3 h-3" />
              <span>Event Room • {event.theme}</span>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-display text-primary drop-shadow-sm group-hover:scale-[1.01] transition-transform origin-left">
              {event.name}
            </h1>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-primary/10 shadow-sm">
              <Users className="w-5 h-5 text-secondary" />
              <div className="text-sm font-bold text-secondary-foreground">
                {event.members?.length || 0} Participants
              </div>
            </div>
          </div>
        </div>

        <Card className="border-primary/10 shadow-2xl shadow-primary/5 bg-white/90 backdrop-blur-md overflow-hidden rounded-3xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-6 border-b border-primary/5">
              <TabsList className="grid w-full grid-cols-3 bg-primary/5 p-1 rounded-2xl">
                <TabsTrigger
                  value="details"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="contributions"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Songbook
                </TabsTrigger>
                <TabsTrigger
                  value="messages"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="details" className="mt-0 outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2">
                        <EventDetails event={event} />
                      </div>
                      <div className="lg:col-span-1">
                        <CarolPlayer event={event} />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="contributions" className="mt-0 outline-none">
                    <EventContributions eventId={event.id} />
                  </TabsContent>

                  <TabsContent value="messages" className="mt-0 outline-none">
                    <EventMessages eventId={event.id} />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}