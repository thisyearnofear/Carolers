'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Sparkles, Music, Loader, CheckCircle, AlertCircle, ChevronDown, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useCarolGeneration } from '../../hooks/use-carol-generation';
import {
  SUNO_MODELS,
  VOCAL_GENDERS,
  STYLE_EXAMPLES,
  GENRE_OPTIONS,
  DURATION_PRESETS,
  getMaxDuration,
  getModelConfig,
  validatePromptLength,
  validateStyleLength,
  validateTitleLength,
} from '@/lib/suno-config';

interface CreateCarolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCarolModal({ open, onOpenChange }: CreateCarolModalProps) {
  const { isSignedIn } = useAuth();
  const { state, submitCarol, reset, isLoading } = useCarolGeneration();
  const [advancedMode, setAdvancedMode] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    lyrics: '',
    genre: '',
    style: '',
    model: 'V5',
    instrumental: false,
    vocalGender: '',
    styleWeight: 0.65,
    weirdnessConstraint: 0.65,
    negativeTags: '',
    customMode: true,
  });

  const modelConfig = getModelConfig(formData.model);
  const maxDuration = getMaxDuration(formData.model);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
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

    if (!validateTitleLength(formData.title, formData.model)) {
      toast.error(`Title exceeds ${modelConfig.maxTitleLength} characters`);
      return;
    }

    if (
      formData.customMode &&
      formData.lyrics &&
      !validatePromptLength(formData.lyrics, formData.model)
    ) {
      toast.error(`Lyrics exceed ${modelConfig.maxPromptLength} characters`);
      return;
    }

    if (
      formData.customMode &&
      formData.style &&
      !validateStyleLength(formData.style, formData.model)
    ) {
      toast.error(`Style exceeds ${modelConfig.maxStyleLength} characters`);
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
    setFormData({
      title: '',
      lyrics: '',
      genre: '',
      style: '',
      model: 'V5',
      instrumental: false,
      vocalGender: '',
      styleWeight: 0.65,
      weirdnessConstraint: 0.65,
      negativeTags: '',
      customMode: true,
    });
    setAdvancedMode(false);
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {state.status === 'idle' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <DialogHeader className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Create New Carol
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    Compose custom music with AI-powered generation
                  </DialogDescription>
                </div>
                <button
                  onClick={() => setAdvancedMode(!advancedMode)}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition"
                >
                  <Zap className="w-4 h-4" />
                  {advancedMode ? 'Basic' : 'Advanced'}
                </button>
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
                  <p className="text-xs text-slate-500">
                    {formData.title.length}/{modelConfig.maxTitleLength} characters
                  </p>
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">AI Model</label>
                  <select
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full h-12 px-4 rounded-2xl border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  >
                    {SUNO_MODELS.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.label} — {model.description}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500">
                    Max duration: {Math.floor(maxDuration / 60)} min
                  </p>
                </div>

                {/* Genre */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Genre</label>
                  <select
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full h-12 px-4 rounded-2xl border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                  >
                    <option value="">Select a genre...</option>
                    {GENRE_OPTIONS.map(genre => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lyrics */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Lyrics</label>
                  <textarea
                    name="lyrics"
                    placeholder={
                      formData.customMode
                        ? 'Provide exact lyrics with [Verse] and [Chorus] tags for best results'
                        : 'Optional: Describe the mood and content for AI lyrics generation'
                    }
                    value={formData.lyrics}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    rows={6}
                    className="w-full p-4 rounded-2xl border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-mono text-sm"
                  />
                  <div className="flex justify-between items-end gap-2">
                    <p className="text-xs text-slate-500">
                      {formData.lyrics.length}/{modelConfig.maxPromptLength} characters
                    </p>
                    {formData.lyrics && (
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => {
                          const examples = STYLE_EXAMPLES[formData.genre as keyof typeof STYLE_EXAMPLES] ||
                            STYLE_EXAMPLES.Other;
                          setFormData(prev => ({
                            ...prev,
                            style: examples[Math.floor(Math.random() * examples.length)],
                          }));
                          toast.success('Style suggestion added');
                        }}
                      >
                        Suggest style
                      </button>
                    )}
                  </div>
                </div>

                {/* Style */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Music Style & Instrumentation
                  </label>
                  <textarea
                    name="style"
                    placeholder="e.g., 'Orchestral with strings and choir', 'Acoustic guitar with warm vocals', 'Jazz piano with smooth vocals'"
                    value={formData.style}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    rows={3}
                    className="w-full p-4 rounded-2xl border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-mono text-sm"
                  />
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500">
                      {formData.style.length}/{modelConfig.maxStyleLength} characters
                    </p>
                    {formData.genre && (
                      <div className="flex flex-wrap gap-1">
                        {STYLE_EXAMPLES[formData.genre as keyof typeof STYLE_EXAMPLES]?.slice(0, 3).map(
                          (example, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, style: example }));
                                toast.success('Style applied');
                              }}
                              className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition"
                            >
                              {example.split(',')[0]}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Audio Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="instrumental"
                        checked={formData.instrumental}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="rounded"
                      />
                      <span className="text-sm font-semibold text-slate-700">Instrumental Only</span>
                    </label>
                  </div>

                  {!formData.instrumental && (
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Vocal Gender</label>
                      <select
                        name="vocalGender"
                        value={formData.vocalGender}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="w-full h-10 px-3 rounded-lg border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-sm"
                      >
                        <option value="">Auto</option>
                        {VOCAL_GENDERS.map(gender => (
                          <option key={gender.id} value={gender.id}>
                            {gender.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Advanced Mode Controls */}
                {advancedMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 p-4 bg-primary/5 rounded-2xl border border-primary/10"
                  >
                    <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Advanced Parameters
                    </h4>

                    {/* Style Weight */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-slate-700">Style Weight</label>
                        <span className="text-xs font-mono bg-white px-2 py-1 rounded">
                          {formData.styleWeight.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        name="styleWeight"
                        min="0"
                        max="1"
                        step="0.05"
                        value={formData.styleWeight}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="w-full"
                      />
                      <p className="text-xs text-slate-500">
                        How strictly to follow the style (0 = loose, 1 = strict)
                      </p>
                    </div>

                    {/* Weirdness Constraint */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-slate-700">Creativity</label>
                        <span className="text-xs font-mono bg-white px-2 py-1 rounded">
                          {formData.weirdnessConstraint.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        name="weirdnessConstraint"
                        min="0"
                        max="1"
                        step="0.05"
                        value={formData.weirdnessConstraint}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="w-full"
                      />
                      <p className="text-xs text-slate-500">
                        How creative the AI can be (0 = conservative, 1 = experimental)
                      </p>
                    </div>

                    {/* Negative Tags */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Exclude Styles</label>
                      <Input
                        name="negativeTags"
                        placeholder="e.g., 'heavy drums, electric guitar' (comma-separated)"
                        value={formData.negativeTags}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="h-10 rounded-lg text-sm"
                      />
                      <p className="text-xs text-slate-500">
                        Things to avoid in the generated music
                      </p>
                    </div>
                  </motion.div>
                )}

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
                  {formData.model === 'V5'
                    ? 'V5 is working its magic... (Usually 30-45 seconds)'
                    : 'Our AI is composing the music... (Usually 30-60 seconds)'}
                </p>
                {state.progress && (
                  <p className="text-xs text-slate-500 mt-4">{state.progress.message}</p>
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
                    <p className="text-xs font-bold text-slate-700 uppercase">Troubleshooting</p>
                    {state.errorCode === 'UNAUTHORIZED' && (
                      <p className="text-sm text-slate-600">
                        You need to be signed in to create carols. Please sign in and try again.
                      </p>
                    )}
                    {state.errorCode === 'SUNO_API_ERROR' && (
                      <div className="text-sm text-slate-600 space-y-1">
                        <p>The Suno AI service is temporarily unavailable.</p>
                        <ul className="list-disc list-inside text-xs space-y-1">
                          <li>Check your API key is configured correctly</li>
                          <li>Try again in a few moments</li>
                          <li>Use a simpler prompt if the issue persists</li>
                        </ul>
                      </div>
                    )}
                    {state.errorCode === 'VALIDATION_ERROR' && (
                      <p className="text-sm text-slate-600">
                        Check that your title, lyrics, and style are within the character limits for your
                        selected model.
                      </p>
                    )}
                    {!state.errorCode ||
                      !['UNAUTHORIZED', 'SUNO_API_ERROR', 'VALIDATION_ERROR'].includes(
                        state.errorCode
                      ) && (
                        <p className="text-sm text-slate-600">
                          An unexpected error occurred. Please try again or contact support if the
                          problem persists.
                        </p>
                      )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
                <Button onClick={() => reset()} className="gap-2">
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
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">
                      Title
                    </p>
                    <h3 className="text-2xl font-display text-primary">{state.carol!.title}</h3>
                  </div>

                  {state.carol!.audioUrl && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">
                        Preview
                      </p>
                      <audio controls src={state.carol!.audioUrl} className="w-full rounded-2xl" />
                    </div>
                  )}

                  {state.carol!.imageUrl && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">
                        Cover Art
                      </p>
                      <img
                        src={state.carol!.imageUrl}
                        alt={state.carol!.title}
                        className="w-full h-48 object-cover rounded-2xl"
                      />
                    </div>
                  )}
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
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button onClick={handleAddToSongbook} className="gap-2">
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
