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

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="w-full max-w-sm"
    >
      <Card className="overflow-hidden border-primary/10 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-lg bg-white/90 backdrop-blur-sm group rounded-3xl">
        <div className={`h-1.5 bg-gradient-to-r ${isPast ? 'from-yellow-400 via-orange-400 to-yellow-500' : 'from-primary via-accent to-secondary'}`} />

        <CardHeader className="p-5 pb-2">
          <div className="flex flex-col gap-1 text-center items-center">
            <div className="flex gap-2">
              <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-tighter px-2 py-0 ${isPast ? 'border-yellow-500/20 text-yellow-600 bg-yellow-50' : 'border-primary/20 text-primary'}`}>
                {isPast ? '🎉 Wrapped' : event.theme}
              </Badge>
              {event.isPrivate === 1 && (
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter px-2 py-0 border-red-200 text-red-600 bg-red-50">
                  <Lock className="w-2.5 h-2.5 mr-1" />
                  Private
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl font-display text-primary group-hover:text-primary transition-colors mt-1">
              {event.name}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-2 pb-4">
          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center text-xs font-bold text-slate-800">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-primary" />
              {eventDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
              <span className="mx-2 opacity-20">|</span>
              <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary" />
              <span className="truncate max-w-[120px]">{event.venue || 'TBA'}</span>
            </div>

            <p className="text-sm text-slate-700 italic leading-snug px-2 line-clamp-2">
              "{event.description}"
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 p-5 pt-0 mt-auto">
          <div className="flex items-center justify-center w-full gap-4 text-[10px] font-bold text-secondary uppercase tracking-widest border-t border-primary/5 pt-4">
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {event.members?.length || 0} Singers
            </div>
            <div className="flex items-center">
              <Music className="h-3 w-3 mr-1" />
              {event.carols?.length || 0} Carols
            </div>
          </div>

          <Button asChild className={`w-full rounded-xl h-10 text-sm font-bold shadow-md ${isPast
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-500/10'
            : 'bg-primary hover:bg-primary/90 text-white shadow-primary/10'
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