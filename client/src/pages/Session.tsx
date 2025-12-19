import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ChevronLeft, SkipBack, SkipForward, Pause, Play, Mic, Volume2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { VerseRoulette } from '@/components/VerseRoulette';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import bgTexture from '@assets/generated_images/subtle_festive_snowflake_background_texture.png';

export default function Session() {
    const [, setLocation] = useLocation();
    const { currentCarolId, isPlaying } = useStore(state => state.player);
    const carols = useStore(state => state.carols);
    const togglePlay = useStore(state => state.togglePlay);
    
    const [activeLine, setActiveLine] = useState(0);

    const currentCarol = carols.find(c => c.id === currentCarolId) || carols[0];

    // Simulate lyrics progression
    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => {
                setActiveLine(prev => (prev + 1) % currentCarol.lyrics.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [isPlaying, currentCarol]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-secondary to-green-950 text-white relative overflow-hidden flex flex-col">
            {/* Background Ambience */}
            <div 
                className="absolute inset-0 opacity-10 mix-blend-overlay bg-cover bg-center pointer-events-none" 
                style={{ backgroundImage: `url(${bgTexture})` }}
            />
            
            {/* Header */}
            <header className="relative z-10 p-6 flex items-center justify-between">
                <Button 
                    variant="ghost" 
                    className="text-white hover:bg-white/10 gap-2"
                    onClick={() => setLocation('/')}
                >
                    <ChevronLeft className="w-5 h-5" />
                    Library
                </Button>
                <div className="text-center">
                    <h2 className="font-display text-xl">{currentCarol.title}</h2>
                    <p className="text-white/60 text-sm">{currentCarol.artist}</p>
                </div>
                <div className="w-24 flex justify-end">
                    <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                        LIVE
                    </div>
                </div>
            </header>

            {/* Lyrics Area */}
            <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto w-full">
                <div className="space-y-8 w-full">
                    {currentCarol.lyrics.map((line, index) => (
                        <motion.div
                            key={index}
                            animate={{ 
                                scale: index === activeLine ? 1.1 : 0.9,
                                opacity: index === activeLine ? 1 : 0.3,
                                y: (index - activeLine) * 40
                            }}
                            className={cn(
                                "font-display text-3xl md:text-5xl transition-colors duration-500",
                                index === activeLine ? "text-accent drop-shadow-lg" : "text-white/40"
                            )}
                        >
                            {line}
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Controls */}
            <footer className="relative z-20 bg-black/40 backdrop-blur-xl border-t border-white/10 p-6 pb-10">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex items-center gap-4 text-sm font-medium text-white/60">
                        <span>1:12</span>
                        <Slider defaultValue={[33]} max={100} step={1} className="flex-1" />
                        <span>{currentCarol.duration}</span>
                    </div>

                    <div className="flex items-center justify-center gap-8">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-12 w-12">
                            <SkipBack className="w-6 h-6" />
                        </Button>
                        
                        <Button 
                            onClick={() => togglePlay()}
                            className="h-20 w-20 rounded-full bg-white text-secondary hover:bg-accent hover:scale-105 transition-all shadow-xl flex items-center justify-center"
                        >
                            {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current pl-1" />}
                        </Button>

                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-12 w-12">
                            <SkipForward className="w-6 h-6" />
                        </Button>
                    </div>

                    <div className="flex justify-between items-center px-4">
                        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white gap-2">
                            <Mic className="w-4 h-4" />
                            Lyrics Sync
                        </Button>
                         <Button variant="ghost" size="sm" className="text-white/60 hover:text-white gap-2">
                            <Volume2 className="w-4 h-4" />
                            Vocals: Full
                        </Button>
                    </div>
                </div>
            </footer>

            <VerseRoulette />
        </div>
    );
}
