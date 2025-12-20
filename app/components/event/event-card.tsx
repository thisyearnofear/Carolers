'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { type Event } from '@shared/schema';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CalendarDays, MapPin, Users, Music, ChevronRight } from 'lucide-react';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="w-full max-w-sm"
    >
      <Card className="overflow-hidden border-primary/10 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-lg bg-white/90 backdrop-blur-sm group rounded-3xl">
        <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-secondary" />

        <CardHeader className="p-5 pb-2">
          <div className="flex flex-col gap-1 text-center items-center">
            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter border-primary/20 text-primary px-2 py-0">
              {event.theme}
            </Badge>
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

          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-10 text-sm font-bold shadow-md shadow-primary/10">
            <Link href={`/events/${event.id}`}>
              Enter Session
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}