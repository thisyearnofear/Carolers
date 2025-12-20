'use client';

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Music, Eye, ThumbsUp, Heart, Sparkles } from 'lucide-react';
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
    <Card className="p-5 hover:shadow-xl transition-all duration-500 relative overflow-hidden border-primary/5 bg-white/50 backdrop-blur-sm group">
      <AnimatePresence>
        {showVoteAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.5 }}
            exit={{ opacity: 0, scale: 2 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <Heart
              className="w-24 h-24 text-primary opacity-50"
              fill="currentColor"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-5">
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Music className="w-7 h-7 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h3 className="font-display text-xl text-primary truncate leading-tight">
                {carol.title}
              </h3>
              <p className="text-sm font-medium text-secondary-foreground/60 truncate">
                {carol.artist}
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-1.5 bg-primary/5 px-3 py-1 rounded-full border border-primary/10"
            >
              <ThumbsUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-bold text-primary">
                {carol.votes || 0}
              </span>
            </motion.div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 italic leading-relaxed">
            "{lyricsPreview}..."
          </p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-[10px] font-bold text-secondary-foreground/40 uppercase tracking-widest">
                {carol.duration}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-secondary-foreground/40 uppercase tracking-widest">Energy</span>
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${energyWidth} ${energyColor} rounded-full`} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {onViewLyrics && carol.lyrics && carol.lyrics.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewLyrics}
                className="flex-1 rounded-xl border-primary/10 hover:bg-primary/5 text-primary font-bold"
              >
                <Eye className="w-4 h-4 mr-2" />
                Lyrics
              </Button>
            )}

            <Button
              onClick={handleVote}
              disabled={voted || isVoting}
              size="sm"
              className={`flex-1 rounded-xl font-bold shadow-lg transition-all ${voted
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
                }`}
            >
              {voted ? (
                <>
                  <Heart className="w-4 h-4 mr-2" fill="currentColor" />
                  Voted
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isVoting ? '...' : 'Vote'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
