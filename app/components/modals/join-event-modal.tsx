'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Users, Calendar, MapPin, PartyPopper, Loader2 } from 'lucide-react';
import { type Event } from '@shared/schema';

interface JoinEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

import { useSafeUser } from '@/hooks/use-safe-user';

export function JoinEventModal({ open, onOpenChange }: JoinEventModalProps) {
  const router = useRouter();
  const { user } = useSafeUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      loadAvailableEvents();
    }
  }, [open, user]);

  const [joinCode, setJoinCode] = useState('');

  const loadAvailableEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');

      const allEvents: Event[] = await response.json();
      // Only show PUBLIC events user hasn't joined yet
      const availableEvents = allEvents.filter(event =>
        !event.members?.includes(user!.id) && event.isPrivate !== 1
      );
      setEvents(availableEvents);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    handleJoinEvent(joinCode.trim());
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!user) return;

    setIsJoining(eventId);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          userId: user.id,
        }),
      });

      if (!response.ok) throw new Error('Invalid code or session not found');

      onOpenChange(false);
      router.push(`/events/${eventId}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsJoining(null);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Date TBA';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-none shadow-2xl rounded-[2.5rem] p-0 overflow-hidden">
        <DialogHeader className="p-8 bg-primary/5 border-b border-primary/5">
          <DialogTitle className="text-3xl font-display text-primary flex items-center gap-3">
            <Users className="w-8 h-8" />
            Find your Chorus
          </DialogTitle>
        </DialogHeader>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Join by Code Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-secondary uppercase tracking-widest px-1">Join by Private Code</h4>
            <form onSubmit={handleJoinByCode} className="flex gap-2">
              <Input
                placeholder="Enter Session ID..."
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="h-12 bg-slate-50 border-slate-200 px-md flex-1"
              />
              <Button type="submit" className="h-12 px-lg shadow-lg shadow-primary/10 active:scale-95" disabled={!joinCode || isJoining === joinCode}>
                Join
              </Button>
            </form>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-primary/5" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">or browse public</span>
            </div>
          </div>

          {error && (
            <div className="p-md bg-red-50 border-2 border-red-100 rounded-card-lg text-red-800 text-sm font-medium">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4 py-8">
              <div className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin mr-3 text-primary" />
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Searching...</span>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-2xl px-lg bg-primary/5 rounded-card-xl border-2 border-dashed border-primary/10">
              <div className="w-16 h-16 mx-auto mb-lg bg-white rounded-full shadow-sm flex items-center justify-center">
                <PartyPopper className="w-8 h-8 text-primary" />
              </div>

              <h4 className="text-xl font-display text-primary mb-md">
                No public sessions found
              </h4>
              <p className="text-sm text-slate-500 mb-lg">
                Be the first to start a celebration! Create your own caroling session and invite others.
              </p>

              <Button
                onClick={() => onOpenChange(false)}
                className="px-2xl h-12 shadow-lg shadow-primary/10"
              >
                Start a New Session
              </Button>
            </div>
          ) : (
            <div className="space-y-md">
              {events.map((event) => (
                <Card key={event.id} variant="elevated" size="md" className="p-md bg-white border-primary/5 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter px-2 py-0 border-primary/20 text-primary">
                          {event.theme}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-display text-primary group-hover:text-accent transition-colors">
                        {event.name}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {formatDate(event.date)}
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            {event.venue}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                     onClick={() => handleJoinEvent(event.id)}
                     disabled={isJoining === event.id}
                     className="w-full h-12 bg-primary/5 hover:bg-primary text-primary hover:text-white transition-all shadow-none hover:shadow-lg hover:shadow-primary/10"
                   >
                    {isJoining === event.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Join Session
                      </>
                    )}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
