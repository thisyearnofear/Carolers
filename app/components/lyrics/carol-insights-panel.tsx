'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Music, Zap, Volume2, Heart } from 'lucide-react';
import { Button } from '../ui/button';

interface CarolInsightsPanelProps {
  title: string;
  artist: string;
  carolInfo?: string | null;
  isLoading?: boolean;
  onLoadInsight?: (type: string) => Promise<void>;
}

interface InsightPrompt {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const INSIGHT_PROMPTS: InsightPrompt[] = [
  {
    id: 'history',
    label: 'History & Origins',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Learn the story behind this carol'
  },
  {
    id: 'techniques',
    label: 'Singing Tips',
    icon: <Volume2 className="w-4 h-4" />,
    description: 'Performance techniques and vocal approaches'
  },
  {
    id: 'difficulty',
    label: 'Difficulty Level',
    icon: <Zap className="w-4 h-4" />,
    description: 'Vocal range, timing, and complexity'
  },
  {
    id: 'cultural',
    label: 'Cultural Context',
    icon: <Heart className="w-4 h-4" />,
    description: 'Traditions and celebrations associated'
  }
];

export function CarolInsightsPanel({
  title,
  artist,
  carolInfo,
  isLoading,
  onLoadInsight
}: CarolInsightsPanelProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [insights, setInsights] = useState<Record<string, string>>({});
  const [loadingPrompt, setLoadingPrompt] = useState<string | null>(null);

  const handlePromptClick = async (promptId: string) => {
    if (insights[promptId]) {
      setSelectedPrompt(selectedPrompt === promptId ? null : promptId);
      return;
    }

    setSelectedPrompt(promptId);
    setLoadingPrompt(promptId);
    
    try {
      // Call AI to generate insight for this specific prompt
      const response = await fetch('/api/carol-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          artist,
          insightType: promptId
        })
      });

      if (response.ok) {
        const { insight } = await response.json();
        setInsights(prev => ({ ...prev, [promptId]: insight }));
      }
    } catch (err) {
      console.error('Failed to load insight:', err);
    } finally {
      setLoadingPrompt(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-primary/10">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">AI Insights</h3>
      </div>

      {/* Suggested Prompts Grid */}
      <div className="grid grid-cols-2 gap-2">
        {INSIGHT_PROMPTS.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => handlePromptClick(prompt.id)}
            className={`p-3 rounded-xl text-left transition-all duration-200 border-2 ${
              selectedPrompt === prompt.id
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-primary/10 bg-white/50 hover:border-primary/30 hover:bg-white'
            }`}
          >
            <div className="flex items-start gap-2 mb-1">
              <span className={`flex-shrink-0 ${selectedPrompt === prompt.id ? 'text-primary' : 'text-slate-400'}`}>
                {prompt.icon}
              </span>
              <h4 className="text-xs font-bold text-slate-700 leading-tight">{prompt.label}</h4>
            </div>
            <p className="text-[11px] text-slate-500">{prompt.description}</p>
          </button>
        ))}
      </div>

      {/* Insight Display */}
      <AnimatePresence mode="wait">
        {selectedPrompt && (
          <motion.div
            key={selectedPrompt}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
              {loadingPrompt === selectedPrompt ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="text-xs text-slate-500 font-medium">Generating insight...</span>
                </div>
              ) : insights[selectedPrompt] ? (
                <div>
                  <div className="flex items-start gap-2 mb-2">
                    <Sparkles className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 leading-relaxed">{insights[selectedPrompt]}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] text-slate-500 h-6 px-2 hover:text-primary"
                    onClick={() => setSelectedPrompt(null)}
                  >
                    Hide
                  </Button>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* General Carol Info */}
      {carolInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 space-y-2"
        >
          <div className="flex items-start gap-2">
            <Music className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">About</h4>
              <p className="text-xs text-amber-700 leading-relaxed">{carolInfo}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
