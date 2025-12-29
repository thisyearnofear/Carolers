'use client';

import { useState, useEffect, useMemo } from 'react';
import { type Event, type Carol } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { EnhancedLyricsViewer } from './lyrics/enhanced-lyrics-viewer';
import { EmptyState } from './empty-state';
import { Button } from './ui/button';
import { Music, Sparkles } from 'lucide-react';
import { VerseRoulette } from './carol/verse-roulette';
import { SongbookControls, type EnergyLevel, type MoodType } from './carol/songbook-controls';
import { PopularCarolsSection } from './carol/popular-carols-section';
import { ExpandableCarolsSection } from './carol/expandable-carols-section';
import { CarolRecommendationCard } from './carol/carol-recommendation-card';
import type { CarolRecommendation } from '@/lib/carol-recommendations';

interface CarolPlayerProps {
  event: Event;
}

export function CarolPlayer({ event }: CarolPlayerProps) {
  const [carols, setCarols] = useState<Carol[]>([]);
  const [selectedCarol, setSelectedCarol] = useState<Carol | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [votedCarols, setVotedCarols] = useState<Set<string>>(new Set());
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel>(null);
  const [selectedMood, setSelectedMood] = useState<MoodType>(null);
  
  // Recommendation state
  const [recommendations, setRecommendations] = useState<CarolRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    async function fetchCarols() {
      try {
        const response = await fetch('/api/carols');
        if (!response.ok) throw new Error('Failed to fetch');
        const allCarols: Carol[] = await response.json();
        const eventCarols = event.carols?.map(id => allCarols.find((c: Carol) => c.id === id)).filter((c): c is Carol => c !== undefined) || [];
        
        // Deduplicate carols by title + artist to prevent display of exact duplicates
        const seen = new Set<string>();
        const deduplicated = eventCarols.filter(carol => {
          const key = `${carol.title}|${carol.artist}`.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        
        setCarols(deduplicated);
      } catch (error) {
        console.error('Failed to fetch carols:', error);
      }
    }

    fetchCarols();
  }, [event.carols]);

  const handleVote = async (carolId: string) => {
    try {
      const response = await fetch(`/api/carols/${carolId}/vote`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to vote');

      // Update local state
      setVotedCarols(prev => new Set(prev).add(carolId));

      // Refresh carols to get updated vote count
      const carolsResponse = await fetch('/api/carols');
      if (carolsResponse.ok) {
        const allCarols: Carol[] = await carolsResponse.json();
        const eventCarols = event.carols?.map(id => allCarols.find((c: Carol) => c.id === id)).filter((c): c is Carol => c !== undefined) || [];
        setCarols(eventCarols);
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleGetRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const recentCarolIds = Array.from(votedCarols).slice(0, 5);
      const response = await fetch(`/api/events/${event.id}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recentCarolIds,
          limit: 3
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
      setShowRecommendations(true);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleSelectRecommendation = async (carolId: string) => {
    // Vote for the recommended carol
    await handleVote(carolId);
    // Scroll or navigate to the carol
    const carol = carols.find(c => c.id === carolId);
    if (carol) {
      handleViewLyrics(carol);
    }
    // Hide recommendations after selection
    setShowRecommendations(false);
  };

  const handleViewLyrics = (carol: Carol) => {
    setSelectedCarol(carol);
    setShowLyrics(true);
  };

  // Filter and search logic
  const filteredCarols = useMemo(() => {
    let result = carols;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(carol =>
        carol.title.toLowerCase().includes(query) ||
        carol.artist.toLowerCase().includes(query)
      );
    }

    // Energy filter
    if (selectedEnergy) {
      result = result.filter(carol => carol.energy === selectedEnergy);
    }

    // Mood filter
    if (selectedMood) {
      if (selectedMood === 'traditional') {
        result = result.filter(carol => 
          (carol.tags && (carol.tags as string[]).includes('Traditional')) ||
          carol.artist === 'Traditional'
        );
      } else if (selectedMood === 'modern') {
        result = result.filter(carol =>
          !(carol.tags && (carol.tags as string[]).includes('Traditional')) &&
          carol.artist !== 'Traditional'
        );
      }
    }

    return result;
  }, [carols, searchQuery, selectedEnergy, selectedMood]);

  // Get IDs of popular carols for deduplication
  const popularCarolIds = useMemo(() => {
    const popular = [...filteredCarols]
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, 7);
    return new Set(popular.map(c => c.id));
  }, [filteredCarols]);

  return (
    <div className="space-y-8">
      <VerseRoulette carols={carols} />

      <Card className="border-2 border-primary/5 shadow-md-lift bg-white/50 backdrop-blur-sm rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/5 p-lg">
          <CardTitle className="font-display text-2xl text-primary flex items-center gap-2">
            <Music className="w-6 h-6" />
            Session Songbook
          </CardTitle>
          <p className="text-xs font-bold text-secondary-foreground/60 uppercase tracking-widest italic">Vote for the carols we'll sing together!</p>
        </CardHeader>
        <CardContent className="p-lg space-y-lg">
          {carols.length > 0 ? (
            <>
              <SongbookControls
                onSearchChange={setSearchQuery}
                onEnergyFilter={setSelectedEnergy}
                onMoodFilter={setSelectedMood}
                selectedEnergy={selectedEnergy}
                selectedMood={selectedMood}
              />

              {/* Smart Recommendations */}
              {votedCarols.size > 0 && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-sm text-slate-900">What to Sing Next?</h3>
                      <p className="text-xs text-slate-600">AI-powered recommendations</p>
                    </div>
                    <Button
                      onClick={handleGetRecommendations}
                      disabled={loadingRecommendations}
                      size="sm"
                      variant="default"
                      className="text-xs"
                    >
                      {loadingRecommendations ? 'Loading...' : 'Get Suggestions'}
                    </Button>
                  </div>

                  {showRecommendations && recommendations.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {recommendations.map((rec, idx) => (
                        <CarolRecommendationCard
                          key={rec.id}
                          recommendation={rec}
                          onSelect={handleSelectRecommendation}
                          isLoading={loadingRecommendations}
                          index={idx}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {filteredCarols.length > 0 ? (
                <div className="space-y-lg">
                  <PopularCarolsSection
                    carols={filteredCarols}
                    votedCarolIds={votedCarols}
                    onVote={handleVote}
                    onViewLyrics={handleViewLyrics}
                  />

                  <ExpandableCarolsSection
                    carols={filteredCarols}
                    votedCarolIds={votedCarols}
                    onVote={handleVote}
                    onViewLyrics={handleViewLyrics}
                    popularCarolIds={popularCarolIds}
                  />
                </div>
              ) : (
                <div className="py-8">
                  <EmptyState
                    icon={<Music className="w-16 h-16" />}
                    title="No carols match your filters"
                    description="Try adjusting your search or filters"
                  />
                </div>
              )}
            </>
          ) : (
            <div>
              <EmptyState
                icon={<Music className="w-16 h-16" />}
                title="The songbook is empty"
                description="Add some carols to start the celebration!"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <EnhancedLyricsViewer
        carol={selectedCarol}
        open={showLyrics}
        onOpenChange={setShowLyrics}
      />
    </div>
  );
}
