import { motion } from 'framer-motion';
import { Play, Plus, Heart, Music } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';
import { type Carol, useStore } from '@/store/useStore';

interface CarolCardProps {
  carol: Carol;
  inPlaylist?: boolean;
}

export function CarolCard({ carol, inPlaylist = false }: CarolCardProps) {
  const playCarol = useStore(state => state.playCarol);
  const addToPlaylist = useStore(state => state.addToPlaylist);
  const removeFromPlaylist = useStore(state => state.removeFromPlaylist);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="group relative overflow-hidden border-none bg-white/50 dark:bg-black/20 shadow-sm hover:shadow-md transition-all">
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
             <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Music className="w-6 h-6" />
             </div>
             <div>
                <h3 className="font-display text-lg leading-none mb-1 text-foreground">{carol.title}</h3>
                <p className="text-sm text-muted-foreground">{carol.artist} • {carol.duration}</p>
             </div>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
                size="icon" 
                variant="secondary" 
                className="rounded-full w-8 h-8"
                onClick={() => playCarol(carol.id)}
            >
                <Play className="w-4 h-4 fill-current" />
            </Button>
            {inPlaylist ? (
                 <Button 
                 size="icon" 
                 variant="ghost" 
                 className="rounded-full w-8 h-8 text-destructive hover:bg-destructive/10"
                 onClick={() => removeFromPlaylist(carol.id)}
             >
                 <Heart className="w-4 h-4 fill-current" />
             </Button>
            ) : (
                <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-full w-8 h-8 hover:bg-primary/10 hover:text-primary"
                onClick={() => addToPlaylist(carol.id)}
            >
                <Plus className="w-4 h-4" />
            </Button>
            )}
          </div>
        </div>
        
        {/* Energy Indicator */}
        <div className={cn(
            "absolute bottom-0 left-0 h-1 transition-all duration-500",
            carol.energy === 'high' ? "w-full bg-accent" : 
            carol.energy === 'medium' ? "w-2/3 bg-secondary" : "w-1/3 bg-primary/50"
        )} />
      </Card>
    </motion.div>
  );
}
