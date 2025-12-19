import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { CarolCard } from './CarolCard';
import { Button } from './ui/button';
import { PlayCircle, Shuffle } from 'lucide-react';
import { useLocation } from 'wouter';

export function PlaylistBuilder() {
    const playlistIds = useStore(state => state.playlist);
    const carols = useStore(state => state.carols);
    const playCarol = useStore(state => state.playCarol);
    const [, setLocation] = useLocation();

    const playlistCarols = playlistIds.map(id => carols.find(c => c.id === id)).filter(Boolean);

    const handleStartSession = () => {
        if (playlistIds.length > 0) {
            playCarol(playlistIds[0]);
            setLocation('/session');
        }
    };

    return (
        <div className="flex flex-col h-full bg-white/40 dark:bg-black/20 rounded-2xl p-6 shadow-xl backdrop-blur-sm border border-white/20">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="font-display text-2xl text-secondary dark:text-white">Your Setlist</h2>
                    <p className="text-sm text-muted-foreground">{playlistCarols.length} carols • 12 mins est.</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                    <Shuffle className="w-4 h-4" />
                    Auto-Order
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 min-h-[300px]">
                <AnimatePresence>
                    {playlistCarols.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-xl p-8">
                            <p>Drag carols here or click + to add</p>
                        </div>
                    ) : (
                        playlistCarols.map((carol, index) => (
                            <motion.div
                                key={carol?.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-display text-muted-foreground w-6 text-center">{index + 1}</span>
                                    <div className="flex-1">
                                        <CarolCard carol={carol!} inPlaylist={true} />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
                <Button 
                    className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                    onClick={handleStartSession}
                    disabled={playlistCarols.length === 0}
                >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Start Session
                </Button>
            </div>
        </div>
    );
}
