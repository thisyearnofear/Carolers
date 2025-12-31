'use client';

import { motion } from 'framer-motion';
import { type Event, type Carol } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Trophy, Music, Users, Star, Share2, Calendar, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface EventRecapProps {
    event: Event;
}

export function EventRecap({ event }: EventRecapProps) {
    const [topSongs, setTopSongs] = useState<Carol[]>([]);
    const [magicRecap, setMagicRecap] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchRecapData = async () => {
        try {
            setLoading(true);
            // Fetch top songs and magic recap in parallel
            const [carolsRes, aiRes] = await Promise.all([
                fetch('/api/carols'),
                fetch(`/api/events/${event.id}/recap`)
            ]);

            if (!carolsRes.ok) throw new Error('Failed to fetch carols');
            const allCarols: Carol[] = await carolsRes.json();

            const eventCarols = event.carols
                ?.map(id => allCarols.find(c => c.id === id))
                .filter((c): c is Carol => c !== undefined)
                .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                .slice(0, 3) || [];

            setTopSongs(eventCarols);

            if (aiRes.ok) {
                const aiData = await aiRes.json();
                setMagicRecap(aiData.magicRecap);
            }
        } catch (error) {
            console.error('Failed to fetch recap data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
            >
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl relative">
                    <Trophy className="w-12 h-12 text-white" />
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white"
                    >
                        Session Over!
                    </motion.div>
                </div>

                <h1 className="text-5xl md:text-7xl font-display text-primary mb-4 drop-shadow-sm">
                    Session Recap
                </h1>
                <p className="text-xl text-slate-800 font-medium mb-6">
                    The magic of {event.name} has been captured.
                </p>
                {(topSongs.length === 0 && magicRecap === null) && (
                    <Button
                        onClick={fetchRecapData}
                        disabled={loading}
                        className="bg-primary text-white hover:shadow-lg"
                    >
                        {loading ? 'Loading Recap...' : 'Generate Recap'}
                    </Button>
                )}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="rounded-[2rem] border-primary/5 bg-white/80 backdrop-blur-sm text-center p-6 shadow-lg shadow-primary/5">
                        <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                        <div className="text-3xl font-display text-primary">{event.members?.length || 0}</div>
                        <div className="text-xs font-bold text-secondary uppercase tracking-widest">Singers</div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="rounded-[2rem] border-primary/5 bg-white/80 backdrop-blur-sm text-center p-6 shadow-lg shadow-primary/5">
                        <Music className="w-8 h-8 text-primary mx-auto mb-3" />
                        <div className="text-3xl font-display text-primary">{event.carols?.length || 0}</div>
                        <div className="text-xs font-bold text-secondary uppercase tracking-widest">Carols Sung</div>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="rounded-[2rem] border-primary/5 bg-white/80 backdrop-blur-sm text-center p-6 shadow-lg shadow-primary/5">
                        <Star className="w-8 h-8 text-primary mx-auto mb-3" />
                        <div className="text-3xl font-display text-primary">
                            {topSongs.reduce((acc, curr) => acc + (curr.votes || 0), 0)}
                        </div>
                        <div className="text-xs font-bold text-secondary uppercase tracking-widest">Total Votes</div>
                    </Card>
                </motion.div>
            </div>

            {magicRecap && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-12"
                >
                    <Card className="rounded-[2.5rem] border-none bg-primary text-white p-8 md:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Plus className="w-32 h-32 rotate-45" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                    <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                                </div>
                                <h3 className="text-xl font-bold uppercase tracking-[0.2em]">The Magic Moment</h3>
                            </div>
                            <p className="text-2xl md:text-3xl font-display leading-tight italic">
                                "{magicRecap}"
                            </p>
                        </div>
                    </Card>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
                <div className="lg:col-span-3">
                    <Card className="rounded-[2.5rem] border-primary/5 bg-white/90 backdrop-blur-md overflow-hidden shadow-2xl">
                        <CardHeader className="bg-primary/5 border-b border-primary/5 px-8 py-6">
                            <CardTitle className="font-display text-2xl text-primary flex items-center gap-3">
                                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                                Crowd Favorites
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {topSongs.map((carol, index) => (
                                    <motion.div
                                        key={carol.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        className="flex items-center gap-6 group"
                                    >
                                        <div className={`w-12 h-12 rounded-card-sm flex items-center justify-center font-display text-2xl shadow-sm ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                            index === 1 ? 'bg-slate-100 text-slate-500' :
                                                'bg-orange-100 text-orange-600'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-display text-xl text-primary">{carol.title}</h4>
                                            <p className="text-sm text-slate-500 font-medium">{carol.artist}</p>
                                        </div>
                                        <div className="text-lg font-bold text-primary bg-primary/5 px-4 py-2 rounded-xl">
                                            {carol.votes} <span className="text-[10px] uppercase font-bold text-secondary tracking-widest ml-1">votes</span>
                                        </div>
                                    </motion.div>
                                ))}

                                {topSongs.length === 0 && (
                                    <p className="text-center py-8 text-slate-400 italic">No votes recorded for this session.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card variant="elevated" size="lg" className="border-primary/5 bg-gradient-to-br from-secondary to-emerald-900 text-white p-2xl shadow-2xl relative overflow-hidden flex-1">
                        <div className="absolute top-0 right-0 p-2xl opacity-10">
                            <Share2 className="w-32 h-32 rotate-12" />
                        </div>
                        <h3 className="text-3xl font-display mb-lg">Share the Joy</h3>
                        <p className="text-white/80 mb-lg leading-relaxed font-medium">
                            Tell the world about your caroling session! Share your vocal achievements and the magic of celebration.
                        </p>
                        <div className="space-y-md">
                            <Button className="w-full bg-white text-secondary hover:bg-slate-100 h-14 text-lg shadow-xl">
                                <Share2 className="w-6 h-6 mr-2" />
                                Social Share
                            </Button>

                            <Link href="/" className="block">
                                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-14 text-lg shadow-xl">
                                    <Plus className="w-6 h-6 mr-2" />
                                    Plan Next Session
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    <Link href="/" className="w-full">
                        <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5 h-14 text-lg bg-white shadow-lg">
                            <ArrowLeft className="w-6 h-6 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
