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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest"
          >
            <Music className="w-3 h-3" />
            <span>Session • {event.theme}</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-display text-primary drop-shadow-sm leading-tight">
            {event.name}
          </h1>

          <div className="flex items-center gap-4 text-xs font-bold text-secondary-foreground/60 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {event.members?.length || 0} Participants
            </div>
            <span className="opacity-20">|</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        <Card className="border-primary/5 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 pt-4 border-b border-primary/5">
              <TabsList className="grid w-full grid-cols-3 bg-primary/5 p-1 rounded-2xl">
                <TabsTrigger
                  value="details"
                  className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                >
                  Prep
                </TabsTrigger>
                <TabsTrigger
                  value="contributions"
                  className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                >
                  Songs
                </TabsTrigger>
                <TabsTrigger
                  value="messages"
                  className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                >
                  Chat
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="details" className="mt-0 outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                      <div className="lg:col-span-3">
                        <EventDetails event={event} />
                      </div>
                      <div className="lg:col-span-2">
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