/**
 * Popular Carols Section
 * 
 * Displays the top N most-voted carols to prevent choice paralysis.
 * Reduces cognitive load while maintaining data-driven curation.
 */

'use client';

import { Card } from '../ui/card';
import { VoteCard } from './vote-card';
import { type Carol } from '@shared/schema';

interface PopularCarolsSectionProps {
  carols: Carol[];
  votedCarolIds: Set<string>;
  onVote: (carolId: string) => void;
  onViewLyrics: (carol: Carol) => void;
}

const POPULAR_CAROLS_COUNT = 7; // Miller's 7±2 rule for cognitive load

export function PopularCarolsSection({
  carols,
  votedCarolIds,
  onVote,
  onViewLyrics,
}: PopularCarolsSectionProps) {
  // Sort by votes descending and take top N
  const popularCarols = [...carols]
    .sort((a, b) => (b.votes || 0) - (a.votes || 0))
    .slice(0, POPULAR_CAROLS_COUNT);

  if (popularCarols.length === 0) return null;

  return (
    <div className="space-y-md">
      <div className="px-lg">
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest">
          Popular Carols
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Most-loved by your guests
        </p>
      </div>
      
      <div className="space-y-md">
        {popularCarols.map((carol) => (
          <VoteCard
            key={carol.id}
            carol={carol}
            voted={votedCarolIds.has(carol.id)}
            onVote={() => onVote(carol.id)}
            onViewLyrics={() => onViewLyrics(carol)}
          />
        ))}
      </div>
    </div>
  );
}
