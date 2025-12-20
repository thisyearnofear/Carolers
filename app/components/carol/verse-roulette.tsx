'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Sparkles, Music, Users, RefreshCcw } from 'lucide-react';
import { type Carol } from '@shared/schema';

interface VerseRouletteProps {
    carols: Carol[];
}

export function VerseRoulette({ carols }: VerseRouletteProps) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [selection, setSelection] = useState<{
        carol: Carol;
        verse: string;
        role: string;
    } | null>(null);

    const roles = ['Soprano', 'Alto', 'Tenor', 'Bass', 'Lead', 'Percussion (Claps!)', 'Humming Harmony'];

    const handleSpin = () => {
        if (carols.length === 0) return;

        setIsSpinning(true);
        setSelection(null);

        // Simulate spin delay
        setTimeout(() => {
            const randomCarol = carols[Math.floor(Math.random() * carols.length)];

            // Filter for verses in lyrics
            const verses = randomCarol.lyrics?.filter(line =>
                line.toLowerCase().includes('[verse') ||
                (line.trim() && !line.toLowerCase().includes('[chorus]'))
            ).slice(0, 5) || ["First Verse"]; // Fallback

            const randomVerse = verses[Math.floor(Math.random() * verses.length)];
            const randomRole = roles[Math.floor(Math.random() * roles.length)];

            setSelection({
                carol: randomCarol,
                verse: randomVerse,
                role: randomRole
            });
            setIsSpinning(false);
        }, 1500);
    };

    return (
        <Card className="border-primary/10 shadow-xl bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />

            <CardContent className="p-8 text-center relative z-10">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2">
                        <RefreshCcw className={`w-8 h-8 ${isSpinning ? 'animate-spin' : ''}`} />
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-display text-3xl text-primary">Verse Roulette</h3>
                        <p className="text-slate-600 text-sm font-medium">
                            Challenge yourself! Spin to be assigned a random verse and role.
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {selection ? (
                            <motion.div
                                key="selection"
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.1, y: -10 }}
                                className="w-full space-y-6"
                            >
                                <div className="p-6 bg-white rounded-2xl shadow-sm border border-primary/5 space-y-4">
                                    <div>
                                        <div className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-1">Your Carol</div>
                                        <div className="font-display text-xl text-primary">{selection.carol.title}</div>
                                    </div>

                                    <div className="h-px bg-primary/5 w-full" />

                                    <div>
                                        <div className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2">Your Part</div>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent-foreground rounded-xl font-bold">
                                            <Users className="w-4 h-4" />
                                            {selection.role}
                                        </div>
                                    </div>

                                    <div className="bg-primary/5 p-4 rounded-xl italic text-slate-700 text-sm leading-relaxed border border-primary/5">
                                        " {selection.verse.replace(/\[.*?\]/g, '').trim()} "
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-2 text-primary font-bold text-xs">
                                    <Sparkles className="w-4 h-4" />
                                    Shine bright, soloist!
                                </div>
                            </motion.div>
                        ) : !isSpinning && (
                            <motion.div
                                key="cta"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-8"
                            >
                                <div className="text-slate-300 italic text-sm">Waiting for the magic...</div>
                            </motion.div>
                        )}

                        {isSpinning && (
                            <motion.div
                                key="spinning"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-12 flex flex-col items-center gap-4"
                            >
                                <div className="flex gap-2">
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                            className="w-3 h-3 bg-primary rounded-full"
                                        />
                                    ))}
                                </div>
                                <div className="text-primary font-bold text-sm animate-pulse uppercase tracking-widest">Assigning Roles...</div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button
                        disabled={isSpinning || carols.length === 0}
                        onClick={handleSpin}
                        className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 font-bold text-lg shadow-xl shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isSpinning ? 'Selecting...' : 'Spin the Roulette'}
                    </Button>

                    {carols.length === 0 && (
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Need carols in your book to spin!
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
