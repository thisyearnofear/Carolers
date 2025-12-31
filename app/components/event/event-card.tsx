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

        <CardHeader className="p-xl pb-md relative">
          {/* Live indicator */}
          {!isPast && daysUntil <= 7 && (
            <motion.div
              className="absolute top-xl right-xl z-10"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Badge className="bg-primary text-white text-xs font-bold uppercase animate-pulse-glow">
                🔴 Coming Soon
              </Badge>
            </motion.div>
          )}

          <div className="flex flex-col gap-md text-center items-center">
            <div className="flex gap-sm flex-wrap justify-center">
              <Badge variant="outline" className={`text-sm ${isPast ? 'border-yellow-500/20 text-yellow-600 bg-yellow-50' : 'border-primary/20 text-primary'}`}>
                {isPast ? '🎉 Wrapped' : event.theme}
              </Badge>
              {event.isPrivate === 1 && (
                <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50 text-sm">
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl font-display text-primary group-hover:text-primary transition-colors">
              {event.name}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-xl pt-md pb-md">
          <div className="space-y-lg text-center">
            <div className="flex items-center justify-center text-sm font-semibold text-slate-800 gap-md flex-wrap">
              <div className="flex items-center gap-sm">
                <CalendarDays className="h-4 w-4 text-primary flex-shrink-0" />
                {eventDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="h-5 w-px bg-slate-300" />
              <div className="flex items-center gap-sm">
                 <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                 <span className="truncate">{event.venue || 'TBA'}</span>
                </div>
            </div>

            <p className="text-base text-slate-700 italic leading-relaxed">
              "{event.description}"
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-lg p-xl pt-md mt-auto">
          <div className="flex items-center justify-between w-full gap-md text-sm font-semibold text-slate-700 border-t border-primary/10 pt-lg">
            <div className="flex items-center gap-sm">
              <Users className="h-4 w-4 text-primary" />
              <span>{event.members?.length || 0} <span className="hidden sm:inline">Singers</span></span>
            </div>
            <div className="flex items-center gap-sm">
              <Music className="h-4 w-4 text-primary" />
              <span>{event.carols?.length || 0} <span className="hidden sm:inline">Carols</span></span>
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