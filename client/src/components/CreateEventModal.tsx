// MODULAR: Dedicated component for event creation
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { X, Calendar, MapPin, Sparkles } from 'lucide-react';
import { eventsAPI } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { useAppUser, getCurrentUserId } from '@/lib/auth';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    theme: 'Christmas',
    venue: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user: appUser } = useAppUser();
  const currentUserId = getCurrentUserId(appUser);
  const loadEvents = useStore(state => state.loadEvents);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const newEvent = await eventsAPI.create({
        ...formData,
        date: new Date(formData.date),
        createdBy: currentUserId,
      });
      
      // ENHANCEMENT FIRST: Automatically join the event as the creator
      await eventsAPI.join(newEvent.id, currentUserId);
      
      // PERFORMANT: Reload events to show the new one
      await loadEvents();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        date: '',
        theme: 'Christmas',
        venue: '',
        description: '',
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-green-800">Create Event</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Christmas Carol Gathering 2024"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Sparkles className="w-4 h-4 inline mr-1" />
              Theme
            </label>
            <select
              value={formData.theme}
              onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="Christmas">Christmas</option>
              <option value="Hanukkah">Hanukkah</option>
              <option value="Easter">Easter</option>
              <option value="New Year">New Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Venue (optional)
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
              placeholder="Central Park Amphitheater"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Join us for a festive caroling event with hot cocoa and holiday cheer!"
              className="min-h-20"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 hover:bg-green-700">
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}