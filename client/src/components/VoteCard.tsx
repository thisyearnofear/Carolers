import { motion } from 'framer-motion';
import { ThumbsUp, Music, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { type Carol } from '@shared/schema';
import { useCelebration, celebrationTriggers } from './Celebration';

interface VoteCardProps {
  carol: Carol;
  voted?: boolean;
  onVote: () => void;
  onViewLyrics?: () => void;
}

export function VoteCard({ carol, voted = false, onVote, onViewLyrics }: VoteCardProps) {
  // ENHANCEMENT FIRST: Add celebration hook
  const { triggerCelebration } = useCelebration();
  
  // Lyrics preview: first 2 non-empty lines
  const lyricsPreview = carol.lyrics
    ?.filter((line: string) => line.trim() && !line.toLowerCase().includes('chorus'))
    .slice(0, 2)
    .join(' ') || 'No lyrics available';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="relative overflow-hidden border-none bg-white/50 dark:bg-black/20 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group">
        {/* Main content - clickable for lyrics */}
        <div
          onClick={onViewLyrics}
          className="space-y-3"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                voted ? 'bg-accent text-white' : 'bg-primary/10 text-primary'
              }`}>
                <Music className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-display text-sm font-bold leading-tight truncate">{carol.title}</h4>
                <p className="text-xs text-muted-foreground">{carol.artist}</p>
              </div>
            </div>

            <div className="text-center flex-shrink-0">
              <div className="font-display text-lg font-bold text-accent">{carol.votes || 0}</div>
              <div className="text-xs text-muted-foreground">votes</div>
            </div>
          </div>

          {/* Lyrics preview - only show if lyrics exist */}
          {carol.lyrics && carol.lyrics.length > 0 && (
            <div className="text-xs text-muted-foreground line-clamp-2 italic px-2 py-2 bg-primary/5 rounded border border-primary/20 group-hover:border-primary/40 transition-colors">
              {lyricsPreview}
            </div>
          )}
        </div>

        {/* Action buttons - prevent click propagation */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-primary/10">
          {carol.lyrics && carol.lyrics.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onViewLyrics?.();
              }}
              className="flex-1 gap-1 text-xs"
            >
              <Eye className="w-3 h-3" />
              View Lyrics
            </Button>
          )}
          <Button
            size="icon"
            variant={voted ? 'default' : 'outline'}
            className={`rounded-full w-8 h-8 transition-all ${voted ? 'bg-accent hover:bg-accent/90' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onVote();
              triggerCelebration(celebrationTriggers.voteSuccess());
            }}
          >
            <ThumbsUp className={`w-4 h-4 ${voted ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Energy bar */}
        <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${
          carol.energy === 'high' ? 'w-full bg-accent' :
          carol.energy === 'medium' ? 'w-2/3 bg-secondary' : 'w-1/3 bg-primary/50'
        }`} />
      </Card>
    </motion.div>
  );
}
