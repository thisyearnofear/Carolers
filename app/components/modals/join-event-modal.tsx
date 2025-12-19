'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Users, Calendar, MapPin, PartyPopper, Loader2 } from 'lucide-react';
import { type Event } from '@shared/schema';

interface JoinEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinEventModal({ open, onOpenChange }: JoinEventModalProps) {
  const router = useRouter();
  const { user } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      loadAvailableEvents();
    }
  }, [open, user]);

  const loadAvailableEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const allEvents: Event[] = await response.json();
      // Only show events user hasn't joined yet
      const availableEvents = allEvents.filter(event => 
        !event.members?.includes(user!.id)
      );
      setEvents(availableEvents);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
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

      if (!response.ok) throw new Error('Failed to join event');

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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-800">
            Join an Event
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4 py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin mr-3 text-green-600" />
              <span className="text-muted-foreground">Loading available events...</span>
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <PartyPopper className="w-8 h-8 text-white" />
            </div>
            
            <h4 className="text-xl font-bold text-green-800 mb-2">
              Be the first to start a celebration! 🎉
            </h4>
            <p className="text-muted-foreground mb-6">
              No available events yet. Create your own caroling event and invite others!
            </p>
            
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Your Own Event
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {events.map((event) => (
              <Card key={event.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-800 mb-1">
                      {event.name}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(event.date)}
                      </div>
                      {event.venue && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.venue}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.members?.length || 0} members
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="secondary" className="ml-2">
                    {event.theme}
                  </Badge>
                </div>

                {event.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {event.description}
                  </p>
                )}

                <Button
                  onClick={() => handleJoinEvent(event.id)}
                  disabled={isJoining === event.id}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isJoining === event.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Join Event
                    </>
                  )}
                </Button>
              </Card>
            ))}
          </div>
        )}

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
