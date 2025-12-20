'use client';

import { useState, useEffect } from 'react';
import { type Event, type Carol } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { VoteCard } from './carol/vote-card';
import { LyricsModal } from './modals/lyrics-modal';
import { Music } from 'lucide-react';

interface CarolPlayerProps {
  event: Event;
}

import { VerseRoulette } from './carol/verse-roulette';

export function CarolPlayer({ event }: CarolPlayerProps) {
  const [carols, setCarols] = useState<Carol[]>([]);
  const [selectedCarol, setSelectedCarol] = useState<Carol | null>(null);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
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
    setShowLyricsModal(true);
  };

  return (
    <div className="space-y-8">
      <VerseRoulette carols={carols} />

      <Card className="border-primary/5 shadow-lg bg-white/50 backdrop-blur-sm rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/5 p-6">
          <CardTitle className="font-display text-2xl text-primary flex items-center gap-2">
            <Music className="w-6 h-6" />
            Session Songbook
          </CardTitle>
          <p className="text-xs font-bold text-secondary-foreground/60 uppercase tracking-widest italic">Vote for the carols we'll sing together!</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
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
              <div className="text-center py-12 px-6 border-2 border-dashed border-primary/10 rounded-2xl bg-primary/5 col-span-full">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Music className="w-8 h-8 text-primary/30" />
                </div>
                <h3 className="font-display text-xl text-primary mb-2">The songbook is empty</h3>
                <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                  Add some carols to start the celebration!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <LyricsModal
        carol={selectedCarol}
        open={showLyricsModal}
        onOpenChange={setShowLyricsModal}
      />
    </div>
  );
}
