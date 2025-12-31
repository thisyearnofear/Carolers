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
import { AIAssistant } from '../ai-assistant';
import { Music, Calendar, Users, MessageSquare, Info, Trophy, Zap } from 'lucide-react';
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-md pt-md border-b border-primary/5">
              <TabsList className="grid w-full grid-cols-5 bg-primary/5 p-xs rounded-card-lg">
                <TabsTrigger
                  value="sing"
                  className="rounded-xl py-2.5 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-slate-500 hover:text-primary"
                >
                  Sing
                </TabsTrigger>
                <TabsTrigger
                  value="prep"
                  className="rounded-xl py-2.5 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-slate-500 hover:text-primary"
                >
                  Prep
                </TabsTrigger>
                <TabsTrigger
                  value="coord"
                  className="rounded-xl py-2.5 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-slate-500 hover:text-primary"
                >
                  Coord
                </TabsTrigger>
                <TabsTrigger
                  value="ai"
                  className="rounded-xl py-2.5 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-slate-500 hover:text-primary"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  AI
                </TabsTrigger>
                <TabsTrigger
                  value="chat"
                  className="rounded-xl py-2.5 text-xs font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-slate-500 hover:text-primary"
                >
                  Chat
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-6 md:p-8">
              <TabsContent value="sing">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-8">
                    <CarolPlayer event={event} />
                    <div className="pt-8 border-t border-primary/5">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Live Session Chat</h3>
                      <EventMessages eventId={event.id} event={event} />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="prep">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <EventDetails event={event} />
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="coord">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <EventContributions eventId={event.id} />
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="ai">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="h-[600px]">
                    <AIAssistant eventId={event.id} />
                  </div>
                </motion.div>
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="chat">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <EventMessages eventId={event.id} event={event} />
                </motion.div>
              </AnimatePresence>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}