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
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-[2rem] border border-primary/5 shadow-sm">
          <h3 className="font-display text-2xl text-primary mb-4">About this Session</h3>
          <p className="text-slate-800 font-medium italic leading-relaxed">
            "{event.description}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-primary/5 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Date</div>
              <div className="text-sm font-bold text-slate-800">
                {eventDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-primary/5 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Venue</div>
              <div className="text-sm font-bold text-slate-800 truncate max-w-[150px]">
                {event.venue || 'To be announced'}
              </div>
            </div>
          </div>
        </div>

        {(event as any).creatorName && (
          <div className="flex items-center gap-3 px-6 py-4 bg-primary/5 rounded-2xl border border-primary/5">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              {(event as any).creatorName.charAt(0)}
            </div>
            <div>
              <div className="text-[10px] font-bold text-secondary-foreground/60 uppercase tracking-widest">Session Lead</div>
              <div className="text-sm font-bold text-primary">{(event as any).creatorName}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}