'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Carol } from '@shared/schema';
import { Music, Search, Filter, BookOpen, Star, ChevronRight, Sparkles, Flame } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { EnhancedLyricsViewer } from '../components/lyrics/enhanced-lyrics-viewer';
import { CreateCarolModal } from '../components/carol/create-carol-modal';
import { CarolCard } from '../components/carol/carol-card';
import { LeaderboardWidget } from '../components/carol/leaderboard-widget';

import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function SongbookContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const initialMood = searchParams.get('mood') || '';
    const initialTab = searchParams.get('tab') || 'official';
    const shouldCreateCarol = searchParams.get('create') === 'true';

    const [carols, setCarols] = useState<Carol[]>([]);
    const [userCarols, setUserCarols] = useState<any[]>([]);
    const [search, setSearch] = useState(initialQuery);
    const [loading, setLoading] = useState(true);
    const [selectedCarol, setSelectedCarol] = useState<Carol | null>(null);
    const [isLyricsOpen, setIsLyricsOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(shouldCreateCarol);
    const [activeTab, setActiveTab] = useState(initialTab); // official | trending | new

    useEffect(() => {
        async function fetchCarols() {
            setLoading(true);
            try {
                if (activeTab === 'official') {
                    // Fetch official carols with search
                    const url = new URL('/api/carols', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
                    if (search) url.searchParams.set('q', search);
                    if (initialMood) url.searchParams.set('mood', initialMood);

                    const response = await fetch(url.toString());
                    if (!response.ok) throw new Error('Failed to fetch');
                    const data = await response.json();
                    setCarols(data);
                } else {
                    // Fetch user-generated carols with sorting
                    const trendingUrl = new URL('/api/carols/trending', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
                    trendingUrl.searchParams.set('sort', activeTab === 'trending' ? 'trending' : 'new');
                    trendingUrl.searchParams.set('limit', '20');
                    const trendingResponse = await fetch(trendingUrl.toString());
                    if (trendingResponse.ok) {
                        const trendingData = await trendingResponse.json();
                        setUserCarols(trendingData);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch carols:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchCarols();
    }, [search, initialMood, activeTab]);

    // Determine which carols to display based on active tab
    const displayCarols = activeTab === 'official' ? carols : userCarols;

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            <header className="mb-12 text-center relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[url('/carolersbanner.png')] bg-cover bg-center" />
                    <div className="absolute inset-0 bg-white/70" />
                </div>
                <div className="relative py-14 px-6">
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
                </div>
            </header>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        placeholder={activeTab === 'official' ? 'Search carols, traditions, or artists...' : 'Search community carols...'}
                        className="pl-12 h-14 bg-white/50 backdrop-blur-sm border-primary/10 rounded-2xl text-lg shadow-sm focus:ring-primary/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={activeTab !== 'official'}
                    />
                </div>
                <Button variant="outline" className="h-14 px-6 rounded-2xl border-primary/10 bg-white/50 gap-2 font-bold">
                    <Filter className="w-5 h-5" />
                    Filter
                </Button>
                <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-14 px-6 rounded-2xl bg-primary text-white gap-2 font-bold hover:shadow-lg shadow-primary/20 transition-shadow"
                >
                    <Sparkles className="w-5 h-5" />
                    Create Carol
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 border-b border-primary/10 pb-4">
                {[
                    { id: 'official', label: 'Official Carols', icon: BookOpen },
                    { id: 'trending', label: 'Trending Now', icon: Flame },
                    { id: 'new', label: 'New Community', icon: Star },
                ].map(tab => {
                    const IconComponent = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                                activeTab === tab.id
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'bg-primary/5 text-slate-700 hover:bg-primary/10'
                            }`}
                        >
                            <IconComponent className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="md:col-span-2 space-y-6">
                    {loading ? (
                        <div className="grid grid-cols-1 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-48 bg-primary/5 animate-pulse rounded-[2rem]" />
                            ))}
                        </div>
                    ) : displayCarols.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {displayCarols.map((carol, index) => (
                                <div
                                    key={carol.id}
                                    onClick={() => {
                                        setSelectedCarol(carol as Carol);
                                        setIsLyricsOpen(true);
                                    }}
                                >
                                    <CarolCard
                                        carol={carol}
                                        index={index}
                                        showMetrics={activeTab !== 'official'}
                                        onClick={() => {
                                            setSelectedCarol(carol as Carol);
                                            setIsLyricsOpen(true);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="col-span-full text-center py-20">
                            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-primary/20" />
                            </div>
                            <h3 className="text-2xl font-display text-primary mb-2">
                                {activeTab === 'official' ? 'No carols found' : 'No community carols yet'}
                            </h3>
                            <p className="text-slate-500">
                                {activeTab === 'official'
                                    ? 'Try searching for something else or browse all traditions.'
                                    : 'Be the first to create a carol!'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Sidebar: Leaderboard */}
                <div className="hidden md:block">
                    <LeaderboardWidget limit={5} />
                </div>
            </div>

            <EnhancedLyricsViewer
                carol={selectedCarol}
                open={isLyricsOpen}
                onOpenChange={setIsLyricsOpen}
            />

            <CreateCarolModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            />
        </div>
    );
}

export default function SongbookPage() {
    return (
        <Suspense fallback={<div>Loading Songbook...</div>}>
            <SongbookContent />
        </Suspense>
    );
}
