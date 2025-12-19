import { type Event } from '@shared/schema';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { CalendarDays, MapPin, Users } from 'lucide-react';

interface EventDetailsProps {
  event: Event;
}

export function EventDetails({ event }: EventDetailsProps) {
  const eventDate = new Date(event.date);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">{event.name}</h2>
            <Badge variant="secondary" className="mt-2">
              {event.theme}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <CalendarDays className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>
              {eventDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          {event.venue && (
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>{event.venue}</span>
            </div>
          )}

          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-muted-foreground" />
            <span>{event.members?.length || 0} participants</span>
          </div>

          <div className="pt-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{event.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}