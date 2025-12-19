import { motion } from 'framer-motion';
import { ThumbsUp, Music } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { type Carol } from '@/store/useStore';

interface VoteCardProps {
  carol: Carol;
  voted?: boolean;
  onVote: () => void;
}

export function VoteCard({ carol, voted = false, onVote }: VoteCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="relative overflow-hidden border-none bg-white/50 dark:bg-black/20 p-4 shadow-sm hover:shadow-md transition-all">
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

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-center">
              <div className="font-display text-lg font-bold text-accent">{carol.votes || 0}</div>
              <div className="text-xs text-muted-foreground">votes</div>
            </div>
            <Button
              size="icon"
              variant={voted ? 'default' : 'outline'}
              className={`rounded-full w-8 h-8 transition-all ${voted ? 'bg-accent hover:bg-accent/90' : ''}`}
              onClick={onVote}
            >
              <ThumbsUp className={`w-4 h-4 ${voted ? 'fill-current' : ''}`} />
            </Button>
          </div>
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
