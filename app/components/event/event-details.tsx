import { type Event } from '@shared/schema';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { CalendarDays, MapPin, Users, Sparkles } from 'lucide-react';

interface EventDetailsProps {
  event: Event;
}

export function EventDetails({ event }: EventDetailsProps) {
  const eventDate = new Date(event.date);
  const ms = eventDate.getTime() - Date.now();
  const isFuture = ms > 0;
  const toHHMMSS = (ms: number) => {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        {isFuture && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <div className="text-xs font-bold uppercase tracking-widest text-primary">Countdown</div>
            <div className="text-sm font-bold text-primary">{toHHMMSS(ms)}</div>
          </div>
        )}
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-[2rem] border border-primary/5 shadow-sm">
          <h3 className="font-display text-2xl text-primary mb-4">Preparation Guide</h3>
          <p className="text-slate-800 font-medium italic leading-relaxed mb-4">
            "{event.description}"
          </p>
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Vocal Range Guide</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['Soprano', 'Alto', 'Tenor', 'Bass'].map((part) => (
                <div key={part} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-primary/5">
                  <div className="w-2 h-2 rounded-full bg-primary/40" />
                  <span className="text-xs font-bold text-slate-700">{part}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Suggested parts for harmonious group singing.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-primary/5 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Session Start</div>
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

        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-[2rem] border border-primary/5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-display text-xl">Theme Context</h3>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            This session focuses on <strong>{event.theme}</strong> themes. We suggest arriving 10 minutes early to warm up your voice and get familiar with the top voted carols in the <strong>Sing</strong> tab.
          </p>
        </div>

        {(event as any).creatorName && (
          <div className="flex items-center gap-3 px-6 py-4 bg-primary/5 rounded-2xl border border-primary/10">
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