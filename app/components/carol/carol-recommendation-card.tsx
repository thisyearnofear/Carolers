'use client';

import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Sparkles, Music, Zap } from 'lucide-react';
import type { CarolRecommendation } from '@/lib/carol-recommendations';

interface CarolRecommendationCardProps {
  recommendation: CarolRecommendation;
  onSelect: (id: string) => void;
  isLoading?: boolean;
  index?: number;
}

const MOMENTUM_CONFIG = {
  building: {
    icon: Zap,
    label: 'Building Energy',
    color: 'text-orange-600 bg-orange-50'
  },
  maintaining: {
    icon: Music,
    label: 'Maintaining Pace',
    color: 'text-blue-600 bg-blue-50'
  },
  'winding-down': {
    icon: Sparkles,
    label: 'Winding Down',
    color: 'text-purple-600 bg-purple-50'
  }
};

export function CarolRecommendationCard({
  recommendation,
  onSelect,
  isLoading = false,
  index = 0
}: CarolRecommendationCardProps) {
  const momentumConfig = MOMENTUM_CONFIG[recommendation.momentum];
  const MomentumIcon = momentumConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-primary/10 hover:border-primary/30 transition-all overflow-hidden">
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-slate-900 truncate">
                {recommendation.title}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                {recommendation.artist}
              </p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${momentumConfig.color}`}>
              <MomentumIcon className="w-3 h-3" />
              <span className="hidden sm:inline">{momentumConfig.label}</span>
            </div>
          </div>

          {/* Reason */}
          <p className="text-xs text-slate-600 leading-relaxed">
            {recommendation.reason}
          </p>

          {/* Energy badge + Action */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100">
              <Music className="w-3 h-3 text-slate-600" />
              <span className="text-xs font-medium text-slate-700 capitalize">
                {recommendation.energy}
              </span>
            </div>
            <Button
              onClick={() => onSelect(recommendation.id)}
              disabled={isLoading}
              size="sm"
              variant="default"
              className="text-xs h-8"
            >
              {isLoading ? 'Loading...' : 'Sing This'}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
