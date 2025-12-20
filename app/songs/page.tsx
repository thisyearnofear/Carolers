'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Carol } from '@shared/schema';
import { Music, Search, Filter, BookOpen, Star, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { LyricsModal } from '../components/modals/lyrics-modal';

export default function SongbookPage() {
    const [carols, setCarols] = useState<Carol[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedCarol, setSelectedCarol] = useState<Carol | null>(null);
    const [isLyricsOpen, setIsLyricsOpen] = useState(false);

    useEffect(() => {
        async function fetchCarols() {
            try {
                const response = await fetch('/api/carols');
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                setCarols(data);
            } catch (error) {
                console.error('Failed to fetch carols:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchCarols();
    }, []);

    const filteredCarols = carols.filter(carol =>
        carol.title.toLowerCase().includes(search.toLowerCase()) ||
        carol.artist.toLowerCase().includes(search.toLowerCase()) ||
        carol.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="container mx-auto px-6 py-12 max-w-5xl">
            <header className="mb-12 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-bold uppercase tracking-widest mb-6"
                >
                    <BookOpen className="w-4 h-4" />
                    Global Songbook
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-display text-primary mb-6">Discovery Every Carol</h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Browse our collection of festive songs from around the world. Prepare your voice and learn the lyrics for your next gathering.
                </p>
            </header>

            <div className="flex flex-col md:flex-row gap-4 mb-12">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        placeholder="Search carols, traditions, or artists..."
                        className="pl-12 h-14 bg-white/50 backdrop-blur-sm border-primary/10 rounded-2xl text-lg shadow-sm focus:ring-primary/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-14 px-6 rounded-2xl border-primary/10 bg-white/50 gap-2 font-bold">
                    <Filter className="w-5 h-5" />
                    Filter
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="h-48 bg-primary/5 animate-pulse rounded-[2rem]" />
                    ))
                ) : filteredCarols.length > 0 ? (
                    filteredCarols.map((carol, index) => (
                        <motion.div
                            key={carol.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card
                                className="group overflow-hidden border-primary/5 hover:border-primary/20 transition-all duration-300 rounded-[2rem] bg-white/80 backdrop-blur-sm cursor-pointer hover:shadow-xl"
                                onClick={() => {
                                    setSelectedCarol(carol);
                                    setIsLyricsOpen(true);
                                }}
                            >
                                <CardContent className="p-6 flex items-center gap-6">
                                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-display shadow-inner ${carol.energy === 'high' ? 'bg-red-50 text-red-600' :
                                            carol.energy === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                                                'bg-blue-50 text-blue-600'
                                        }`}>
                                        {carol.title.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {carol.tags?.slice(0, 2).map(tag => (
                                                <Badge key={tag} variant="secondary" className="bg-primary/5 text-primary text-[10px] uppercase font-bold px-2 py-0 border-none">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-display text-primary truncate group-hover:text-accent transition-colors">
                                            {carol.title}
                                        </h3>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{carol.artist}</p>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-primary/20 group-hover:text-primary transition-colors pr-2" />
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20">
                        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-primary/20" />
                        </div>
                        <h3 className="text-2xl font-display text-primary mb-2">No carols found</h3>
                        <p className="text-slate-500">Try searching for something else or browse all traditions.</p>
                    </div>
                )}
            </div>

            <LyricsModal
                carol={selectedCarol}
                open={isLyricsOpen}
                onOpenChange={setIsLyricsOpen}
            />
        </div>
    );
}
