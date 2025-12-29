'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Event } from '@shared/schema';
import { Lightbulb, Music, Zap, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { SetlistCard } from '../carol/setlist-card';

interface SetlistSong {
  title: string;
  artist?: string;
  duration?: string;
  energy?: string;
  tags?: string[];
}

interface PlanEventSectionProps {
  event: Event;
}

export function PlanEventSection({ event }: PlanEventSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [setlist, setSetlist] = useState<SetlistSong[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePlan = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First try advanced reasoning with Gemini 3
      try {
        const reasoningResponse = await fetch('/api/carol-reasoning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reasonAboutSetlist',
            args: {
              theme: event.theme,
              groupSize: event.members?.length || 8,
              duration: 45,
              singerSkillLevel: 'intermediate'
            }
          })
        });

        if (reasoningResponse.ok) {
          const { result } = await reasoningResponse.json();
          console.log('Reasoning insights:', result);
          // Use insights to enhance the setlist
        }
      } catch (reasoningErr) {
        console.warn('Advanced reasoning unavailable, using standard setlist:', reasoningErr);
      }

      // Call AI assistant to suggest setlist
      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'suggestSetlist',
          args: {
            theme: event.theme,
            duration: '45 minutes'
          }
        })
      });

      if (!response.ok) throw new Error('Failed to generate plan');
      
      const { result } = await response.json();
      if (result.success && result.setlist) {
        setSetlist(result.setlist);
        setIsOpen(true);
      } else {
        setError('Could not generate a setlist');
      }
    } catch (err) {
      console.error('Error generating plan:', err);
      setError('Failed to generate event plan');
    } finally {
      setLoading(false);
    }
  };

  const energyFlow = [
    {
      phase: 'Warm-up',
      songs: 5,
      description: 'Energetic, familiar carols to get voices loose',
      icon: Zap,
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    {
      phase: 'Main Event',
      songs: 8,
      description: 'Core setlist - mix of classics and crowd favorites',
      icon: Music,
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      phase: 'Wind Down',
      songs: 3,
      description: 'Slower, reflective carols to close the event',
      icon: Lightbulb,
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white/50 backdrop-blur-sm p-lg rounded-card-xl border-2 border-primary/5 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-xl text-primary">Plan This Event</h3>
              <p className="text-xs text-slate-600 mt-1">
                Get AI-powered suggestions for setlist structure and energy flow
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              if (isOpen) {
                setIsOpen(false);
              } else {
                generatePlan();
              }
            }}
            disabled={loading}
            variant={isOpen ? 'outline' : 'default'}
            size="sm"
            className="text-xs h-8"
          >
            {loading ? 'Generating...' : isOpen ? 'Hide Plan' : 'Generate Plan'}
          </Button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 pt-4 border-t border-primary/5"
            >
              {!setlist && !error && (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-600">Click "Generate Plan" above to create a setlist</p>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}

              {setlist && (
                <>
                  {/* Energy Flow Guide */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Suggested Energy Flow</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {energyFlow.map(({ phase, songs, description, icon: Icon, color }) => (
                        <div
                          key={phase}
                          className={`p-3 rounded-lg border ${color}`}
                        >
                          <Icon className="w-4 h-4 mb-2" />
                          <div className="text-xs font-bold">{phase}</div>
                          <div className="text-[11px] opacity-75">{songs} songs</div>
                          <p className="text-[10px] mt-1 opacity-60 leading-tight">{description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Setlist */}
                  <SetlistCard
                    songs={setlist}
                    theme={event.theme}
                    totalDuration="~30-40 min"
                    title="Your Suggested Setlist"
                    description={`Tailored for "${event.theme}" theme • 45-minute session`}
                    compact={false}
                  />

                  {/* Tips */}
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
                    <div className="text-xs font-bold text-amber-900">💡 Planning Tips</div>
                    <ul className="text-xs text-amber-800 space-y-1">
                      <li>• Arrange singers by vocal range (Soprano, Alto, Tenor, Bass)</li>
                      <li>• Have everyone arrive 10 minutes early to warm up</li>
                      <li>• Adjust pacing based on group energy during the event</li>
                      <li>• Keep backup carols ready in case timing changes</li>
                    </ul>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
