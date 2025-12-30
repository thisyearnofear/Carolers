'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { type Event } from '@shared/schema';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CalendarDays, MapPin, Users, Music, ChevronRight, Trophy, Lock } from 'lucide-react';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date);

  const isPast = eventDate < new Date();
  const daysUntil = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="w-full"
      role="article"
      aria-label={`${event.name} event on ${eventDate.toLocaleDateString()}`}
    >
      <Card 
        className="overflow-hidden border-2 border-primary/10 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md-lift bg-white/90 backdrop-blur-sm group rounded-card-xl"
        role="region"
        aria-label={`Event: ${event.name}`}
      >
        <motion.div 
          className={`h-1.5 bg-gradient-to-r ${isPast ? 'from-yellow-400 via-orange-400 to-yellow-500' : 'from-primary via-accent to-secondary'}`}
          whileHover={{ scaleY: 2 }}
          transition={{ duration: 0.3 }}
        />

        <CardHeader className="p-lg pb-sm relative">
          {/* Live indicator */}
          {!isPast && daysUntil <= 7 && (
            <motion.div
              className="absolute top-lg right-lg z-10"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Badge className="bg-primary text-white text-[10px] font-bold uppercase animate-pulse-glow">
                🔴 Coming Soon
              </Badge>
            </motion.div>
          )}

          <div className="flex flex-col gap-xs text-center items-center">
            <div className="flex gap-sm">
              <Badge variant="outline" className={`${isPast ? 'border-yellow-500/20 text-yellow-600 bg-yellow-50' : 'border-primary/20 text-primary'}`}>
                {isPast ? '🎉 Wrapped' : event.theme}
              </Badge>
              {event.isPrivate === 1 && (
                <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50">
                  <Lock className="w-2.5 h-2.5 mr-1" />
                  Private
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl font-display text-primary group-hover:text-primary transition-colors mt-xs">
              {event.name}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-lg pt-sm pb-md">
          <div className="space-y-md text-center">
            <div className="flex items-center justify-center text-xs font-bold text-slate-800 gap-md flex-wrap">
              <div className="flex items-center gap-xs">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                {eventDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="h-4 w-px bg-slate-300" />
              <div className="flex items-center gap-xs">
                 <MapPin className="h-3.5 w-3.5 text-primary" />
                 <span className="truncate">{event.venue || 'TBA'}</span>
               </div>
            </div>

            <p className="text-sm text-slate-700 italic leading-relaxed">
              "{event.description}"
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-md p-lg pt-sm mt-auto">
          <div className="flex items-center justify-between w-full gap-md text-[10px] font-bold text-secondary uppercase tracking-widest border-t border-primary/5 pt-lg">
            <div className="flex items-center gap-xs">
              <Users className="h-3 w-3" />
              {event.members?.length || 0} Singers
            </div>
            <div className="flex items-center gap-xs">
              <Music className="h-3 w-3" />
              {event.carols?.length || 0} Carols
            </div>
          </div>

          <Button asChild className={`w-full h-12 transition-all ${isPast
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-500/20'
            : ''
            }`}>
            <Link href={isPast ? `/events/${event.id}/recap` : `/events/${event.id}`}>
              {isPast ? 'View Recap' : 'Enter Session'}
              {isPast ? <Trophy className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}