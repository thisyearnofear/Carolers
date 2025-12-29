/**
 * Songbook Controls
 * 
 * Search and filter interface for the carol songbook.
 * Includes search box and energy/mood filter chips.
 */

'use client';

import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type EnergyLevel = 'low' | 'medium' | 'high' | null;
export type MoodType = 'traditional' | 'modern' | null;

interface SongbookControlsProps {
  onSearchChange: (query: string) => void;
  onEnergyFilter: (energy: EnergyLevel) => void;
  onMoodFilter: (mood: MoodType) => void;
  selectedEnergy: EnergyLevel;
  selectedMood: MoodType;
}

const ENERGY_OPTIONS: Array<{ value: EnergyLevel; label: string; icon: string }> = [
  { value: 'low', label: '🌙 Low Energy', icon: '🌙' },
  { value: 'medium', label: '✨ Medium Energy', icon: '✨' },
  { value: 'high', label: '⚡ High Energy', icon: '⚡' },
];

const MOOD_OPTIONS: Array<{ value: MoodType; label: string }> = [
  { value: 'traditional', label: 'Traditional' },
  { value: 'modern', label: 'Modern' },
];

export function SongbookControls({
  onSearchChange,
  onEnergyFilter,
  onMoodFilter,
  selectedEnergy,
  selectedMood,
}: SongbookControlsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  const handleEnergyClick = (energy: EnergyLevel) => {
    onEnergyFilter(selectedEnergy === energy ? null : energy);
  };

  const handleMoodClick = (mood: MoodType) => {
    onMoodFilter(selectedMood === mood ? null : mood);
  };

  const hasActiveFilters = selectedEnergy || selectedMood || searchQuery;

  return (
    <div className="space-y-4">
      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          type="text"
          placeholder="Search carols..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {/* Energy Filters */}
        {ENERGY_OPTIONS.map((option) => (
          <Button
            key={option.value}
            onClick={() => handleEnergyClick(option.value)}
            variant={selectedEnergy === option.value ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'transition-all whitespace-nowrap',
              selectedEnergy === option.value && 'bg-primary text-white'
            )}
          >
            {option.label}
          </Button>
        ))}

        {/* Mood Divider */}
        {MOOD_OPTIONS.length > 0 && (
          <div className="w-px bg-slate-200 my-auto" />
        )}

        {/* Mood Filters */}
        {MOOD_OPTIONS.map((option) => (
          <Button
            key={option.value}
            onClick={() => handleMoodClick(option.value)}
            variant={selectedMood === option.value ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'transition-all whitespace-nowrap',
              selectedMood === option.value && 'bg-primary text-white'
            )}
          >
            {option.label}
          </Button>
        ))}

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <Button
            onClick={() => {
              handleSearchChange('');
              handleEnergyClick(null);
              handleMoodClick(null);
            }}
            variant="ghost"
            size="sm"
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}
