import Link from 'next/link';
import { type Event } from '@shared/schema';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CalendarDays, MapPin, Users } from 'lucide-react';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date);
  
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{event.name}</CardTitle>
          <Badge variant="secondary">{event.theme}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <CalendarDays className="h-4 w-4 mr-1" />
          {eventDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </div>
        
        {event.venue && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            {event.venue}
          </div>
        )}
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-1" />
          {event.members?.length || 0} participants
        </div>
        <Button asChild>
          <Link href={`/events/${event.id}`}>Join Event</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}