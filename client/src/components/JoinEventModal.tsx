// MODULAR: Dedicated component for joining events
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner, EventCardSkeleton } from '@/components/ui/LoadingSpinner';
import { X, Users, Calendar, MapPin, PartyPopper, Plus } from 'lucide-react';
import { eventsAPI } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { type Event } from '@shared/schema';
import { useAppUser, getCurrentUserId } from '@/lib/auth';

interface JoinEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinSuccess: (eventId: string) => void;
}

export function JoinEventModal({ isOpen, onClose, onJoinSuccess }: JoinEventModalProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { user: appUser, isLoading: isAuthLoading } = useAppUser();
  const currentUser = getCurrentUserId(appUser);

  useEffect(() => {
    if (isOpen && !isAuthLoading) {
      loadAvailableEvents();
    }
  }, [isOpen, isAuthLoading]);

  const loadAvailableEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allEvents = await eventsAPI.getAll();
      // CLEAN: Only show events user hasn't joined yet
      const availableEvents = allEvents.filter(event => 
        !event.members.includes(currentUser)
      );
      setEvents(availableEvents);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    setIsJoining(eventId);
    setError(null);

    try {
      await eventsAPI.join(eventId, currentUser);
      onJoinSuccess(eventId);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsJoining(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl p-6 bg-white max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-green-800">Join an Event</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner className="mr-3" />
              <span className="text-muted-foreground">Loading available events...</span>
            </div>
            {/* PERFORMANT: Show skeleton cards while loading */}
            {[...Array(3)].map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <PartyPopper className="w-8 h-8 text-white" />
            </div>
            
            <h4 className="text-xl font-display font-bold text-primary mb-2">
              Be the first to start a celebration! 🎉
            </h4>
            
            <p className="text-gray-600 mb-6 max-w-xs mx-auto">
              No events available yet. Create your own gathering and invite others to join the festive fun!
            </p>
            
            <Button 
              onClick={onClose} 
              className="bg-green-600 hover:bg-green-700 gap-2 shadow-lg mb-4"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              Create Your Own Event
            </Button>
            
            <p className="text-sm text-gray-500 italic">
              "The best way to spread holiday cheer is singing loud for all to hear!"
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="p-4 border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {event.name}
                    </h3>
                    
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>
                      
                      {event.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {event.venue}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {event.members.length} member{event.members.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-3">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.theme === 'Christmas' ? 'bg-red-100 text-red-800' :
                        event.theme === 'Hanukkah' ? 'bg-blue-100 text-blue-800' :
                        event.theme === 'Easter' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {event.theme}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleJoinEvent(event.id)}
                    disabled={isJoining === event.id}
                    className="ml-4 bg-green-600 hover:bg-green-700"
                  >
                    {isJoining === event.id ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Joining...
                      </>
                    ) : (
                      'Join Event'
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t mt-6">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}