import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Dices, Star } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export function VerseRoulette() {
    const { activeChallenge, assignedRole } = useStore(state => state.gamification);
    const triggerRoulette = useStore(state => state.triggerRoulette);
    const addPoints = useStore(state => state.addPoints);
    
    const [isSpinning, setIsSpinning] = useState(false);

    const handleSpin = () => {
        setIsSpinning(true);
        setTimeout(() => {
            triggerRoulette();
            setIsSpinning(false);
            addPoints(50);
        }, 2000);
    };

    return (
        <div className="fixed bottom-8 right-8 z-40">
            <AnimatePresence>
                {activeChallenge && !isSpinning && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute bottom-20 right-0 mb-4 w-72 bg-gradient-to-br from-accent to-orange-400 text-white p-6 rounded-2xl shadow-2xl origin-bottom-right"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="font-display text-xl font-bold">Verse Challenge!</h3>
                            <Star className="w-5 h-5 fill-white text-white animate-pulse" />
                        </div>
                        <div className="text-center py-4 bg-black/10 rounded-xl mb-3 backdrop-blur-sm">
                            <p className="text-sm opacity-90 uppercase tracking-wider font-bold">Role Assigned</p>
                            <p className="text-2xl font-bold mt-1">{assignedRole}</p>
                        </div>
                        <p className="text-sm text-white/90 text-center">Sing this verse with the assigned style for +50pts!</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                size="lg"
                onClick={handleSpin}
                disabled={isSpinning}
                className={cn(
                    "h-16 w-16 rounded-full shadow-2xl border-4 border-white/20 transition-all duration-700",
                    isSpinning ? "animate-spin bg-muted" : "bg-gradient-to-r from-primary to-rose-600 hover:scale-110"
                )}
            >
                <Dices className={cn("w-8 h-8 text-white", isSpinning && "opacity-50")} />
            </Button>
        </div>
    );
}
