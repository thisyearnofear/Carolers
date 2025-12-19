'use client';

import { useState, useEffect } from 'react';
import { type Event, type Carol } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { VoteCard } from './carol/vote-card';
import { LyricsModal } from './modals/lyrics-modal';

interface CarolPlayerProps {
  event: Event;
}

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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Event Carols</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
              <div className="text-center py-8 text-muted-foreground">
                <p>No carols added to this event yet.</p>
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
    </>
  );
}
