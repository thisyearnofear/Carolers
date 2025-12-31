'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Heart,
  Music,
  Users,
  Globe,
  Mic,
  BookOpen,
  Star,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface CarolCompanionProps {
  carolTitle: string;
  carolArtist: string;
}

type InsightType = 'story' | 'singAlong' | 'traditions' | 'performance';

interface InsightCard {
  id: InsightType;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  borderColor: string;
  prompt: string;
}

const INSIGHT_CARDS: InsightCard[] = [
  {
    id: 'story',
    title: 'The Story',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'text-rose-600',
    bgGradient: 'from-rose-50 to-pink-50',
    borderColor: 'border-rose-200',
    prompt: 'Tell me the heartwarming story and history behind this carol'
  },
  {
    id: 'singAlong',
    title: 'Sing Along',
    icon: <Mic className="w-5 h-5" />,
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-50 to-green-50',
    borderColor: 'border-emerald-200',
    prompt: 'Give me tips to sing this carol beautifully with others'
  },
  {
    id: 'traditions',
    title: 'Traditions',
    icon: <Globe className="w-5 h-5" />,
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-sky-50',
    borderColor: 'border-blue-200',
    prompt: 'Share the cultural traditions and celebrations around this carol'
  },
  {
    id: 'performance',
    title: 'Performance',
    icon: <Users className="w-5 h-5" />,
    color: 'text-purple-600',
    bgGradient: 'from-purple-50 to-violet-50',
    borderColor: 'border-purple-200',
    prompt: 'Help me arrange this carol for our group performance'
  }
];

export function CarolCompanion({ carolTitle, carolArtist }: CarolCompanionProps) {
  const [activeInsight, setActiveInsight] = useState<InsightType | null>(null);
  const [insights, setInsights] = useState<Record<InsightType, string>>({} as any);
  const [loading, setLoading] = useState<InsightType | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const fetchInsight = async (type: InsightType) => {
    // If already loaded, just set active
    if (insights[type]) {
      setActiveInsight(type);
      return;
    }

    setLoading(type);
    setActiveInsight(type);
    setHasInteracted(true);

    try {
      const card = INSIGHT_CARDS.find(c => c.id === type);
      const response = await fetch('/api/carol-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: carolTitle,
          artist: carolArtist,
          insightType: type,
          prompt: card?.prompt
        })
      });

      if (response.ok) {
        const { insight } = await response.json();
        setInsights(prev => ({ ...prev, [type]: insight }));
      }
    } catch (error) {
      console.error('Failed to fetch insight:', error);
    } finally {
      setLoading(null);
    }
  };

  const activeCard = INSIGHT_CARDS.find(c => c.id === activeInsight);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Warm Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-2 text-amber-600">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm font-semibold tracking-wide">Carol Companion</span>
          <Star className="w-4 h-4 fill-current" />
        </div>
        <p className="text-xs text-slate-500">
          {hasInteracted
            ? "Discover the magic in every note"
            : "Choose what you'd like to explore"}
        </p>
      </motion.div>

      {/* Interactive Cards */}
      <div className="grid grid-cols-2 gap-3">
        {INSIGHT_CARDS.map((card, index) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fetchInsight(card.id)}
            className={`relative p-4 rounded-2xl transition-all duration-300 ${
              activeInsight === card.id
                ? `bg-gradient-to-br ${card.bgGradient} ${card.borderColor} border-2 shadow-md`
                : 'bg-white border-2 border-slate-100 hover:border-slate-200 hover:shadow-sm'
            }`}
          >
            {/* Loading State */}
            {loading === card.id && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Loader2 className={`w-5 h-5 animate-spin ${card.color}`} />
              </div>
            )}

            <div className="flex flex-col items-center text-center gap-2">
              <div className={`${activeInsight === card.id ? card.color : 'text-slate-400'}`}>
                {card.icon}
              </div>
              <span className={`text-sm font-semibold ${
                activeInsight === card.id ? 'text-slate-800' : 'text-slate-600'
              }`}>
                {card.title}
              </span>
            </div>

            {/* Active Indicator */}
            {activeInsight === card.id && (
              <motion.div
                layoutId="active-indicator"
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
              >
                <div className={`w-2 h-2 rounded-full ${card.color.replace('text', 'bg')}`} />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Content Display */}
      <AnimatePresence mode="wait">
        {activeInsight && activeCard && insights[activeInsight] && (
          <motion.div
            key={activeInsight}
            initial={{ opacity: 0, height: 0, y: 10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`rounded-2xl bg-gradient-to-br ${activeCard.bgGradient} ${activeCard.borderColor} border-2 overflow-hidden`}
          >
            <div className="p-6 space-y-4">
              {/* Section Header */}
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl bg-white/70 ${activeCard.color}`}>
                  {activeCard.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-base">
                    {activeCard.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {carolTitle} · {carolArtist}
                  </p>
                </div>
              </div>

              {/* Insight Content */}
              <div className="prose prose-sm max-w-none">
                <div className="space-y-3 text-slate-700 leading-relaxed">
                  {insights[activeInsight].split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-sm">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Magical Footer */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/50">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Sparkles className="w-3 h-3" />
                  <span>Crafted with carol magic</span>
                </div>
                <button
                  onClick={() => setActiveInsight(null)}
                  className="text-xs text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1"
                >
                  <span>Close</span>
                  <ChevronRight className="w-3 h-3 rotate-90" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Festive Call to Action (when nothing selected) */}
      {!activeInsight && !hasInteracted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100"
        >
          <Heart className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <p className="text-sm text-amber-800 font-medium mb-1">
            Ready to explore?
          </p>
          <p className="text-xs text-amber-600">
            Each carol has its own special story, traditions, and tips to share
          </p>
        </motion.div>
      )}

      {/* Language Translation Teaser */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-2 py-3"
      >
        <Globe className="w-3 h-3 text-slate-400" />
        <span className="text-xs text-slate-500">
          Sing in other languages available below
        </span>
      </motion.div>
    </div>
  );
}
