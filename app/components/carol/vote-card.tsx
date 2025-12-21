'use client';

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Music, Eye, Heart, Sparkles } from 'lucide-react';
import { type Carol } from '@shared/schema';
import { motion, AnimatePresence } from 'framer-motion';

interface VoteCardProps {
  carol: Carol;
  voted?: boolean;
  onVote: () => void;
  onViewLyrics?: () => void;
}

export function VoteCard({ carol, voted = false, onVote, onViewLyrics }: VoteCardProps) {
  const [showVoteAnimation, setShowVoteAnimation] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    setIsVoting(true);
    await onVote();
    setShowVoteAnimation(true);
    setTimeout(() => setShowVoteAnimation(false), 2000);
    setIsVoting(false);
  };

  const lyricsPreview = carol.lyrics
    ?.filter(line => line.trim() && !line.toLowerCase().includes('chorus'))
    .slice(0, 2)
    .join(' ') || 'No lyrics available';

  const energyWidth = carol.energy === 'high' ? 'w-full' :
    carol.energy === 'medium' ? 'w-2/3' :
      'w-1/3';

  const energyColor = carol.energy === 'high' ? 'bg-primary' :
    carol.energy === 'medium' ? 'bg-accent' :
      'bg-secondary';

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }} 
      transition={{ duration: 0.3 }} 
      className="w-full"
      role="article"
      aria-label={`${carol.title} by ${carol.artist}${voted ? ' - You voted for this' : ''}`}
    >
      <Card 
        className={`p-lg hover:shadow-md-lift transition-all duration-300 relative overflow-hidden border-2 bg-white/50 backdrop-blur-sm group rounded-card-lg ${
          voted ? 'border-primary/20 shadow-sm' : 'border-slate-200 shadow-sm hover:border-primary/30'
        }`}
        role="region"
        aria-live="polite"
        aria-label={`Carol card: ${carol.title}`}
      >
        <AnimatePresence>
          {showVoteAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.5 }}
              exit={{ opacity: 0, scale: 2 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <Heart
                className="w-32 h-32 text-primary opacity-40"
                fill="currentColor"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-md">
          {/* Header */}
          <div className="flex items-start gap-md">
            <motion.div
              className={`flex-shrink-0 w-14 h-14 rounded-card-sm flex items-center justify-center transition-transform duration-300 ${
                voted ? 'bg-primary/10' : 'bg-gradient-to-br from-primary/10 to-accent/10 group-hover:scale-110'
              }`}
              whileHover={!voted ? { scale: 1.1 } : {}}
            >
              <Music className="w-7 h-7 text-primary" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <h3 className="font-display text-xl text-primary truncate leading-tight">
                {carol.title}
              </h3>
              <p className="text-sm font-medium text-secondary-foreground/60 truncate">
                {carol.artist}
              </p>
            </div>

            {/* Vote count */}
            <motion.div
              whileHover={!voted ? { scale: 1.1 } : {}}
              className={`flex items-center gap-xs px-md py-xs rounded-full whitespace-nowrap ${
                voted ? 'bg-primary/10 text-primary' : 'bg-slate-100 hover:bg-primary/10 hover:text-primary'
              } transition-colors`}
            >
              <Heart className="w-4 h-4" fill="currentColor" />
              <span className="text-sm font-bold tabular-nums">{carol.votes || 0}</span>
            </motion.div>
          </div>

          {/* Lyrics preview */}
          {carol.lyrics && carol.lyrics.length > 0 && (
            <p className="text-sm text-slate-600 italic line-clamp-2 leading-relaxed">
              "{lyricsPreview}..."
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-md text-xs">
            {/* Duration badge */}
            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
              {carol.duration}
            </Badge>

            {/* Energy visualization */}
             <div className="flex items-center gap-xs" role="img" aria-label={`Energy level: ${carol.energy || 'unknown'}`}>
               <span className="text-[10px] font-bold text-slate-700 uppercase">Energy</span>
               <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden" aria-hidden="true">
                 <motion.div
                   className={`h-full rounded-full ${energyColor}`}
                   initial={{ width: 0 }}
                   animate={{ width: energyWidth }}
                   transition={{ duration: 0.6, ease: 'easeOut' }}
                 />
               </div>
             </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-md pt-md border-t border-slate-100">
            {onViewLyrics && carol.lyrics && carol.lyrics.length > 0 && (
              <Button
                onClick={onViewLyrics}
                variant="outline"
                size="sm"
                className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                <Eye className="w-4 h-4 mr-xs" />
                Lyrics
              </Button>
            )}

            <Button
              onClick={handleVote}
              disabled={voted || isVoting}
              size="sm"
              className={`flex-1 transition-all ${voted
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'active:scale-95'
              }`}
              aria-label={voted ? `You voted for ${carol.title}` : `Vote for ${carol.title}`}
              aria-pressed={voted}
            >
              {voted ? (
                <>
                  <Heart className="w-4 h-4 mr-xs" fill="currentColor" aria-hidden="true" />
                  Voted
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-xs" aria-hidden="true" />
                  {isVoting ? 'Voting...' : 'Vote'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
