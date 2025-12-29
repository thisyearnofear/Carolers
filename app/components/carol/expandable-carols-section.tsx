/**
 * Expandable Carols Section
 * 
 * Progressive disclosure of remaining carols.
 * Stays collapsed by default to prevent choice overload.
 */

'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { VoteCard } from './vote-card';
import { type Carol } from '@shared/schema';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpandableCarolsSectionProps {
  carols: Carol[];
  votedCarolIds: Set<string>;
  onVote: (carolId: string) => void;
  onViewLyrics: (carol: Carol) => void;
  popularCarolIds: Set<string>; // IDs of carols in popular section
}

export function ExpandableCarolsSection({
  carols,
  votedCarolIds,
  onVote,
  onViewLyrics,
  popularCarolIds,
}: ExpandableCarolsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter out carols already shown in popular section
  const remainingCarols = carols.filter(carol => !popularCarolIds.has(carol.id));

  if (remainingCarols.length === 0) return null;

  return (
    <div className="space-y-md border-t border-slate-200 pt-md">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="outline"
        className="w-full justify-between"
      >
        <span className="text-sm font-medium">
          {isExpanded ? 'Hide' : 'View all'} {remainingCarols.length} carols
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-md overflow-hidden"
          >
            {remainingCarols.map((carol) => (
              <VoteCard
                key={carol.id}
                carol={carol}
                voted={votedCarolIds.has(carol.id)}
                onVote={() => onVote(carol.id)}
                onViewLyrics={() => onViewLyrics(carol)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
