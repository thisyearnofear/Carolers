'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar, MapPin, Sparkles, Loader2 } from 'lucide-react';

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

import { useSafeUser } from '@/hooks/use-safe-user';

export function CreateEventModal({ open, onOpenChange }: CreateEventModalProps) {
  const router = useRouter();
  const { user } = useSafeUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    theme: 'Christmas',
    venue: '',
    description: '',
    isPrivate: false,
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isPrivate: formData.isPrivate ? 1 : 0,
          date: new Date(formData.date).toISOString(),
          createdBy: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const newEvent = await response.json();

      // Reset form
      setFormData({
        name: '',
        date: '',
        theme: 'Christmas',
        venue: '',
        description: '',
        isPrivate: false,
        password: '',
      });

      onOpenChange(false);
      router.refresh(); // Refresh to show new event
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-[2.5rem] overflow-hidden p-0">
        <DialogHeader className="p-lg bg-primary/5 border-b border-primary/5">
          <DialogTitle className="text-3xl font-display text-primary flex items-center gap-md">
            <Sparkles className="w-8 h-8" />
            Plan a Session
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-lg space-y-lg max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-md bg-red-50 border-2 border-red-200 rounded-xl text-red-800 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-sm">
            <Label htmlFor="name" className="text-xs font-bold text-secondary uppercase tracking-widest px-1">Session Name</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Neighborhood Christmas Sing-Along"
              className="rounded-lg h-12 bg-slate-50 border-2 border-slate-200 focus:border-primary ring-0 focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-sm">
              <Label htmlFor="date" className="text-xs font-bold text-secondary uppercase tracking-widest">Date & Time</Label>
              <Input
                id="date"
                type="datetime-local"
                required
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="rounded-lg h-12 bg-slate-50 border-2 border-slate-200 focus:border-primary ring-0 focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div className="space-y-sm">
              <Label htmlFor="theme" className="text-xs font-bold text-secondary uppercase tracking-widest">Tradition</Label>
              <Select
                value={formData.theme}
                onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}
              >
                <SelectTrigger className="rounded-lg h-12 bg-slate-50 border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-slate-200 shadow-md-lift">
                  <SelectItem value="Christmas">🎄 Christmas</SelectItem>
                  <SelectItem value="Hanukkah">🕎 Hanukkah</SelectItem>
                  <SelectItem value="Easter">🐰 Easter</SelectItem>
                  <SelectItem value="New Year">🎊 New Year</SelectItem>
                  <SelectItem value="General">✨ Seasonal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-sm">
            <Label htmlFor="venue" className="text-xs font-bold text-secondary uppercase tracking-widest">Venue</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
              placeholder="e.g. Central Park West Entrance"
              className="rounded-lg h-12 bg-slate-50 border-2 border-slate-200 focus:border-primary ring-0 focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div className="space-y-sm">
            <Label htmlFor="description" className="text-xs font-bold text-secondary uppercase tracking-widest">About the Session</Label>
            <textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Tell your singers what to expect..."
              className="w-full p-md bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 min-h-[100px] text-sm font-sans"
            />
          </div>

          <div className="space-y-md pt-sm">
            <div className="flex items-center gap-md">
              <input
                type="checkbox"
                id="isPrivate"
                className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                checked={formData.isPrivate}
                onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
              />
              <div className="flex flex-col">
                <Label htmlFor="isPrivate" className="font-bold text-slate-800 cursor-pointer">Private Session</Label>
                <span className="text-[10px] text-slate-500 font-medium italic">Only visible with a direct link or invite code.</span>
              </div>
            </div>

            {formData.isPrivate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-sm"
              >
                <Label htmlFor="password" className="text-[10px] font-bold text-secondary uppercase tracking-widest">Session Password (Optional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="e.g. carolers2024"
                  className="rounded-lg h-12 bg-slate-50 border-2 border-slate-200 focus:border-primary ring-0 focus:ring-4 focus:ring-primary/10"
                />
              </motion.div>
            )}
          </div>

          <div className="flex gap-md pt-md">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl border-2"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 font-bold shadow-md shadow-green-600/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
