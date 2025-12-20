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
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="overflow-hidden border-primary/10 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl bg-white/80 backdrop-blur-sm group">
        <div className="h-2 bg-gradient-to-r from-primary via-accent to-secondary" />

        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-2xl font-display text-primary group-hover:text-primary transition-colors">
              {event.name}
            </CardTitle>
            <Badge className="bg-secondary/10 text-secondary border-none hover:bg-secondary/20">
              {event.theme}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <div className="space-y-3">
            <div className="flex items-center text-sm font-medium text-secondary-foreground/70">
              <CalendarDays className="h-4 w-4 mr-2 text-primary" />
              {eventDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>

            {event.venue && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                {event.venue}
              </div>
            )}

            <p className="text-sm text-muted-foreground line-clamp-2 italic leading-relaxed">
              "{event.description}"
            </p>

            {(event as any).creatorName && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-primary/5">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                  {(event as any).creatorName.charAt(0)}
                </div>
                <span className="text-xs text-muted-foreground">
                  By <span className="font-semibold text-secondary">{(event as any).creatorName}</span>
                </span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center bg-primary/5 py-4 mt-auto">
          <div className="flex items-center text-xs font-bold text-secondary uppercase tracking-wider">
            <Users className="h-3 w-3 mr-1" />
            {event.members?.length || 0} Singers
          </div>
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white group/btn">
            <Link href={`/events/${event.id}`} className="flex items-center">
              Join the Song
              <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}