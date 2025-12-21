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
import { Music, Calendar, Users, MessageSquare, Info, Trophy } from 'lucide-react';
import { useSafeUser } from '@/hooks/use-safe-user';
import { Button } from '../ui/button';
import Link from 'next/link';

interface EventRoomProps {
  event: Event;
}

export function EventRoom({ event }: EventRoomProps) {
  const [activeTab, setActiveTab] = useState('sing');
  const { user } = useSafeUser();
  const isCreator = user?.id === event.createdBy;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest"
            >
              <Music className="w-3 h-3" />
              <span>Session • {event.theme}</span>
            </motion.div>

            {isPast && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-widest border border-yellow-200"
              >
                <Trophy className="w-3 h-3" />
                <span>Wrapped</span>
              </motion.div>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-display text-primary drop-shadow-sm leading-tight">
            {event.name}
          </h1>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="flex items-center gap-4 text-xs font-bold text-secondary-foreground/60 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {event.members?.length || 0} Singers
              </div>
              <span className="opacity-20">|</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>

            <Link href={`/events/${event.id}/recap`}>
              <Button variant="outline" size="sm" className="h-8 rounded-full border-primary/20 text-primary hover:bg-primary/5 text-[10px] font-bold uppercase tracking-widest">
                <Trophy className="w-3 h-3 mr-2" />
                View Recap
              </Button>
            </Link>
          </div>
        </div>

        <Card className="border-primary/5 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 pt-4 border-b border-primary/5">
              <TabsList className="grid w-full grid-cols-4 bg-primary/5 p-1 rounded-2xl">
                <TabsTrigger
                  value="sing"
                  className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                >
                  Sing
                </TabsTrigger>
                <TabsTrigger
                  value="prep"
                  className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                >
                  Prep
                </TabsTrigger>
                <TabsTrigger
                  value="coord"
                  className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                >
                  Coord
                </TabsTrigger>
                <TabsTrigger
                  value="chat"
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
                  <TabsContent value="sing" className="mt-0 outline-none">
                    <CarolPlayer event={event} />
                  </TabsContent>

                  <TabsContent value="prep" className="mt-0 outline-none">
                    <EventDetails event={event} />
                  </TabsContent>

                  <TabsContent value="coord" className="mt-0 outline-none">
                    <EventContributions eventId={event.id} />
                  </TabsContent>

                  <TabsContent value="chat" className="mt-0 outline-none">
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