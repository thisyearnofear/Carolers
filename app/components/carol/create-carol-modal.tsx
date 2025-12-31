'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Sparkles, Music, Loader, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useCarolGeneration } from '../../hooks/use-carol-generation';

interface CreateCarolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCarolModal({ open, onOpenChange }: CreateCarolModalProps) {
  const { isSignedIn } = useAuth();
  const { state, submitCarol, reset, cancel, isLoading } = useCarolGeneration();

  const [formData, setFormData] = useState({
    title: '',
    lyrics: '',
    genre: 'Christmas',
    style: 'Traditional',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      toast.error('You must be signed in to create carols');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Carol title is required');
      return;
    }

    try {
      await submitCarol(formData);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleClose = () => {
    reset();
    setFormData({ title: '', lyrics: '', genre: 'Christmas', style: 'Traditional' });
    onOpenChange(false);
  };

  const handleAddToSongbook = () => {
    toast.success('Carol added to your creations!');
    handleClose();
  };

  if (!isSignedIn) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>You must be signed in to create carols</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {state.status === 'idle' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Create New Carol
                </DialogTitle>
                <DialogDescription>
                  Write the lyrics and let AI compose the music for your carol
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleGenerate} className="space-y-6">
                {state.error && (
                  <div className="flex gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">{state.error}</p>
                    </div>
                  </div>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Carol Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="title"
                    placeholder="e.g., 'The Joy of Winter'"
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="h-12 rounded-2xl"
                  />
                </div>

                {/* Lyrics */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Lyrics
                  </label>
                  <textarea
                    name="lyrics"
                    placeholder="Write your carol lyrics here. If left empty, AI will help generate them."
                    value={formData.lyrics}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    rows={6}
                    className="w-full p-4 rounded-2xl border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                  <p className="text-xs text-slate-500">
                    Tip: Include verse and chorus structure with [Verse] and [Chorus] tags for better results
                  </p>
                </div>

                {/* Genre & Style */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">
                      Genre
                    </label>
                    <select
                      name="genre"
                      value={formData.genre}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full h-12 px-4 rounded-2xl border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    >
                      <option value="Christmas">Christmas</option>
                      <option value="Holiday">Holiday</option>
                      <option value="Winter">Winter</option>
                      <option value="Religious">Religious</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">
                      Style
                    </label>
                    <select
                      name="style"
                      value={formData.style}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full h-12 px-4 rounded-2xl border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    >
                      <option value="Traditional">Traditional</option>
                      <option value="Modern">Modern</option>
                      <option value="Acoustic">Acoustic</option>
                      <option value="Jazz">Jazz</option>
                      <option value="Pop">Pop</option>
                      <option value="Folk">Folk</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.title.trim()}
                    className="gap-2"
                  >
                    <Music className="w-4 h-4" />
                    Generate Carol
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {(state.status === 'submitting' || state.status === 'generating') && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 space-y-6"
            >
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                  <Loader className="w-8 h-8 text-primary animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-display text-primary">Creating Your Carol</h3>
                <p className="text-slate-600 max-w-sm">
                  Our AI is composing the music and arranging the lyrics. This usually takes 30-60 seconds...
                </p>
                {state.progress && (
                  <p className="text-xs text-slate-500 mt-4">
                    {state.progress.message}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ delay: i * 0.15, duration: 0.6, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {state.status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Carol Generation Failed
                </DialogTitle>
              </DialogHeader>

              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm font-bold text-red-700 mb-2">{state.error}</p>
                    {state.errorDetails && (
                      <p className="text-sm text-red-600 mb-3">{state.errorDetails}</p>
                    )}
                  </div>

                  <div className="bg-white rounded-lg p-3 space-y-2 border border-red-100">
                    <p className="text-xs font-bold text-slate-700 uppercase">What went wrong?</p>
                    {state.errorCode === 'UNAUTHORIZED' && (
                      <p className="text-sm text-slate-600">
                        You need to be signed in to create carols. Please sign in and try again.
                      </p>
                    )}
                    {state.errorCode === 'SUNO_API_ERROR' && (
                      <p className="text-sm text-slate-600">
                        The Suno AI service is temporarily unavailable. Please check your API key is configured correctly and try again in a few moments.
                      </p>
                    )}
                    {state.errorCode === 'CLERK_CONFIG_ERROR' && (
                      <p className="text-sm text-slate-600">
                        There's a configuration issue with authentication. Please refresh the page and try again.
                      </p>
                    )}
                    {state.errorCode === 'DATABASE_ERROR' && (
                      <p className="text-sm text-slate-600">
                        Failed to save your carol. Please try again.
                      </p>
                    )}
                    {!state.errorCode || !['UNAUTHORIZED', 'SUNO_API_ERROR', 'CLERK_CONFIG_ERROR', 'DATABASE_ERROR'].includes(state.errorCode) && (
                      <p className="text-sm text-slate-600">
                        An unexpected error occurred. Please try again or contact support if the problem persists.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  Close
                </Button>
                <Button
                  onClick={() => reset()}
                  className="gap-2"
                >
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}

          {state.status === 'complete' && state.carol && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Carol Ready!
                </DialogTitle>
              </DialogHeader>

              <Card className="border-primary/10 bg-primary/5">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Title</p>
                    <h3 className="text-2xl font-display text-primary">{state.carol!.title}</h3>
                  </div>

                  {state.carol!.audioUrl && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Preview</p>
                      <audio
                        controls
                        src={state.carol!.audioUrl}
                        className="w-full rounded-2xl"
                      />
                    </div>
                  )}

                  {state.carol!.imageUrl && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Cover Art</p>
                      <img
                        src={state.carol!.imageUrl}
                        alt={state.carol!.title}
                        className="w-full h-48 object-cover rounded-2xl"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                      {formData.genre}
                    </Badge>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                      {formData.style}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
                <p className="font-bold mb-1">Next steps:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Add your carol to events for others to sing</li>
                  <li>Share your creation with the community</li>
                  <li>Watch other singers perform your carol</li>
                </ul>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={handleAddToSongbook}
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Add to My Carols
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
