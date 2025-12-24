'use client';

import { useState, useEffect } from 'react';
import { type Event, type Carol } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { VoteCard } from './carol/vote-card';
import { EnhancedLyricsViewer } from './lyrics/enhanced-lyrics-viewer';
import { EmptyState } from './empty-state';
import { Music } from 'lucide-react';
import { VerseRoulette } from './carol/verse-roulette';

interface CarolPlayerProps {
  event: Event;
}

export function CarolPlayer({ event }: CarolPlayerProps) {
  const [carols, setCarols] = useState<Carol[]>([]);
  const [selectedCarol, setSelectedCarol] = useState<Carol | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [votedCarols, setVotedCarols] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchCarols() {
      try {
        const response = await fetch('/api/carols');
        if (!response.ok) throw new Error('Failed to fetch');
        const allCarols: Carol[] = await response.json();
        const eventCarols = event.carols?.map(id => allCarols.find((c: Carol) => c.id === id)).filter((c): c is Carol => c !== undefined) || [];
        setCarols(eventCarols);
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

  const handleViewLyrics = (carol: Carol) => {
    setSelectedCarol(carol);
    setShowLyrics(true);
  };

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
        <CardContent className="p-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-md">
            {carols.length > 0 ? (
              carols.map((carol) => (
                <VoteCard
                  key={carol.id}
                  carol={carol}
                  voted={votedCarols.has(carol.id)}
                  onVote={() => handleVote(carol.id)}
                  onViewLyrics={() => handleViewLyrics(carol)}
                />
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState
                  icon={<Music className="w-16 h-16" />}
                  title="The songbook is empty"
                  description="Add some carols to start the celebration!"
                />
              </div>
            )}
          </div>
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
