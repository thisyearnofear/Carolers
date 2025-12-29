# Design System Implementation Guide

## Quick Reference: Design Token Values

### Spacing Scale
```
xs: 0.25rem (4px)     - tight spacing
sm: 0.5rem (8px)      - small gaps
md: 1rem (16px)       - standard/default
lg: 1.5rem (24px)     - generous spacing
xl: 2rem (32px)       - spacious
2xl: 3rem (48px)      - hero spacing
```

### Border Radius
```
rounded-lg: 0.5rem (8px)      - input, small elements
rounded-xl: 0.75rem (12px)    - buttons, badges
rounded-2xl: 1rem (16px)      - medium cards
rounded-3xl: 1.5rem (24px)    - large cards
rounded-[2rem]: 2rem (32px)   - hero cards, events
```

### Color Semantic Meanings
```
primary (red):      actions, primary focus, festive
secondary (green):  supporting info, confirmation
accent (gold):      highlights, success states
slate:              neutral text, borders, disabled
```

### Shadow Hierarchy
```
shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)           - subtle
shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)         - elevated
shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)       - prominent
shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)       - hero
custom-sm-lift: 0 4px 12px rgba(0,0,0,0.08)          - lift effect
custom-md-lift: 0 8px 24px rgba(0,0,0,0.12)          - strong lift
```

---

## Component Implementation Examples

### 1. Enhanced Event Card

```tsx
'use client';

import { motion } from 'framer-motion';
import { type Event } from '@shared/schema';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, MapPin, Users, Music, ChevronRight, Trophy } from 'lucide-react';
import Link from 'next/link';

interface EnhancedEventCardProps {
  event: Event;
}

export function EnhancedEventCard({ event }: EnhancedEventCardProps) {
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const daysUntil = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // Featured carols (show up to 2)
  const featuredCarols = event.carols?.slice(0, 2) || [];

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="w-full max-w-sm group"
    >
      <div className={`
        relative rounded-[2rem] overflow-hidden
        border-2 transition-all duration-300
        bg-white/90 backdrop-blur-sm
        ${isPast 
          ? 'border-amber-200 shadow-sm hover:shadow-md-lift' 
          : 'border-primary/10 shadow-sm hover:shadow-md-lift hover:border-primary/30'
        }
      `}>
        
        {/* Gradient header stripe - animated on hover */}
        <motion.div
          className={`h-1.5 bg-gradient-to-r ${
            isPast 
              ? 'from-amber-400 via-orange-400 to-amber-500'
              : 'from-primary via-accent to-secondary'
          }`}
          whileHover={{ scaleY: 2 }}
          transition={{ duration: 0.3 }}
        />

        {/* Live indicator for upcoming events */}
        {!isPast && daysUntil <= 7 && (
          <motion.div
            className="absolute top-4 right-4 z-10"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Badge className="bg-red-500 text-white text-[10px] font-bold uppercase">
              🔴 Coming Soon
            </Badge>
          </motion.div>
        )}

        <div className="p-lg">
          {/* Header */}
          <div className="mb-lg">
            <div className="flex flex-col gap-xs mb-md">
              <Badge 
                variant="outline" 
                className={`w-fit text-[10px] uppercase font-bold tracking-tighter px-md py-xs ${
                  isPast 
                    ? 'border-amber-500/20 text-amber-600 bg-amber-50' 
                    : 'border-primary/20 text-primary bg-primary/5'
                }`}
              >
                {isPast ? '🎉 Wrapped' : event.theme || 'Event'}
              </Badge>
            </div>
            
            <h2 className="font-display text-2xl text-primary leading-tight group-hover:text-primary transition-colors">
              {event.name}
            </h2>
          </div>

          {/* Meta information */}
          <div className="space-y-md mb-lg">
            <div className="flex flex-wrap items-center gap-lg text-xs font-bold text-slate-700">
              <div className="flex items-center gap-xs">
                <Calendar className="w-4 h-4 text-primary" />
                <span>
                  {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="h-4 w-px bg-slate-300" />
              <div className="flex items-center gap-xs">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="truncate max-w-[150px]">{event.venue || 'TBA'}</span>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed italic">
              "{event.description}"
            </p>
          </div>

          {/* Featured carols preview */}
          {featuredCarols.length > 0 && (
            <div className="mb-lg">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-xs">Featured</p>
              <div className="flex flex-wrap gap-xs">
                {featuredCarols.map((carolId) => (
                  <Badge 
                    key={carolId}
                    className="bg-primary/5 text-primary text-[9px] font-bold"
                  >
                    <Music className="w-3 h-3 mr-1" />
                    {/* Show carol name if available */}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Stats bar */}
          <div className="flex items-center justify-between border-t border-primary/5 pt-lg mb-lg text-[10px] font-bold text-secondary uppercase tracking-widest gap-md">
            <div className="flex items-center gap-xs">
              <Users className="w-4 h-4" />
              {event.members?.length || 0} Singers
            </div>
            <div className="flex items-center gap-xs">
              <Music className="w-4 h-4" />
              {event.carols?.length || 0} Songs
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            asChild 
            className={`
              w-full rounded-xl h-12 text-sm font-bold shadow-md transition-all
              ${isPast
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
              }
            `}
          >
            <Link href={isPast ? `/events/${event.id}/recap` : `/events/${event.id}`}>
              {isPast ? 'View Recap' : 'Enter Session'}
              {isPast ? <Trophy className="w-4 h-4 ml-2" /> : <ChevronRight className="w-4 h-4 ml-2" />}
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
```

### 2. Enhanced Vote Card

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Carol } from '@shared/schema';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Music, Eye, Heart, Sparkles, Zap } from 'lucide-react';

interface EnhancedVoteCardProps {
  carol: Carol;
  voted?: boolean;
  onVote: () => void;
  onViewLyrics?: () => void;
}

export function EnhancedVoteCard({ carol, voted = false, onVote, onViewLyrics }: EnhancedVoteCardProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    setIsVoting(true);
    await onVote();
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
    setIsVoting(false);
  };

  const energyBarWidth = carol.energy === 'high' ? 'w-full' :
    carol.energy === 'medium' ? 'w-2/3' : 'w-1/3';

  const energyColor = carol.energy === 'high' ? 'bg-gradient-to-r from-primary to-red-600' :
    carol.energy === 'medium' ? 'bg-gradient-to-r from-accent to-yellow-500' :
      'bg-gradient-to-r from-secondary to-green-600';

  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.3 }} className="w-full">
      <div className={`
        relative rounded-[1.5rem] border-2 overflow-hidden
        bg-white/50 backdrop-blur-sm transition-all duration-300
        ${voted
          ? 'border-primary/20 shadow-sm'
          : 'border-slate-200 shadow-sm hover:shadow-md-lift hover:border-primary/30'
        }
      `}>

        {/* Vote celebration animation */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.5 }}
              exit={{ opacity: 0, scale: 2 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <Heart className="w-32 h-32 text-primary opacity-40" fill="currentColor" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-lg space-y-md">
          {/* Header with icon and votes */}
          <div className="flex items-start gap-md">
            <motion.div
              className={`
                flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center
                ${voted
                  ? 'bg-primary/10'
                  : 'bg-gradient-to-br from-primary/10 to-accent/10 group-hover:scale-110'
                } transition-transform duration-300
              `}
              whileHover={!voted ? { scale: 1.1 } : {}}
            >
              <Music className="w-7 h-7 text-primary" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <h3 className="font-display text-xl text-primary leading-tight truncate">
                {carol.title}
              </h3>
              <p className="text-sm font-medium text-secondary-foreground/60">
                {carol.artist}
              </p>
            </div>

            {/* Vote count */}
            <motion.div
              whileHover={!voted ? { scale: 1.1 } : {}}
              className={`
                flex items-center gap-xs px-md py-xs rounded-full
                ${voted 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-slate-100 hover:bg-primary/10 hover:text-primary'
                } transition-colors
              `}
            >
              <Heart className="w-4 h-4" fill="currentColor" />
              <span className="text-sm font-bold tabular-nums">{carol.votes || 0}</span>
            </motion.div>
          </div>

          {/* Lyrics preview */}
          {carol.lyrics && carol.lyrics.length > 0 && (
            <p className="text-sm text-slate-600 italic line-clamp-2 leading-relaxed">
              "{carol.lyrics
                .filter(line => line.trim() && !line.toLowerCase().includes('['))
                .slice(0, 1)
                .join(' ')}..."
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-md text-xs">
            {/* Duration */}
            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
              <span className="font-bold">{carol.duration}</span>
            </Badge>

            {/* Energy visualization */}
            <div className="flex items-center gap-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Energy</span>
              <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${energyColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: energyBarWidth }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Tags */}
            {carol.tags && carol.tags.length > 0 && (
              <div className="flex gap-xs">
                {carol.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} className="bg-primary/5 text-primary text-[9px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-md pt-md border-t border-slate-100">
            {onViewLyrics && carol.lyrics && carol.lyrics.length > 0 && (
              <Button
                onClick={onViewLyrics}
                variant="outline"
                size="sm"
                className="flex-1 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
              >
                <Eye className="w-4 h-4 mr-xs" />
                Lyrics
              </Button>
            )}

            <Button
              onClick={handleVote}
              disabled={voted || isVoting}
              size="sm"
              className={`
                flex-1 rounded-xl font-bold shadow-md transition-all
                ${voted
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20 active:scale-95'
                }
              `}
            >
              {voted ? (
                <>
                  <Heart className="w-4 h-4 mr-xs" fill="currentColor" />
                  Voted
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-xs" />
                  {isVoting ? 'Voting...' : 'Vote'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
```

### 3. Empty State Component (Reusable)

```tsx
import { ReactNode } from 'react';
import { Button } from './ui/button';
import { Music } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'compact';
}

export function EmptyState({
  icon = <Music className="w-16 h-16" />,
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  if (variant === 'compact') {
    return (
      <div className="py-lg px-md text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
        <div className="text-slate-400 mb-md opacity-40">
          {icon}
        </div>
        <h3 className="font-display text-lg text-slate-700 mb-xs">{title}</h3>
        <p className="text-sm text-slate-500 mb-md">{description}</p>
        {action && (
          <Button onClick={action.onClick} size="sm" className="rounded-lg">
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="py-2xl px-lg text-center border-2 border-dashed border-primary/10 rounded-[2rem] bg-primary/5">
      <div className="text-primary/20 mb-lg flex justify-center">
        {icon}
      </div>
      <h3 className="font-display text-2xl text-primary mb-md leading-tight">{title}</h3>
      <p className="text-base text-slate-600 mb-2xl max-w-sm mx-auto">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="rounded-xl">
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

### 4. Loading Card (Skeleton Pattern)

```tsx
'use client';

import { motion } from 'framer-motion';

export function VoteCardSkeleton() {
  return (
    <motion.div
      animate={{
        opacity: [0.6, 1, 0.6],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="rounded-[1.5rem] border-2 border-slate-200 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 p-lg h-48"
    />
  );
}

export function EventCardSkeleton() {
  return (
    <motion.div
      animate={{
        opacity: [0.6, 1, 0.6],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="rounded-[2rem] border-2 border-slate-200 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 p-lg h-64"
    />
  );
}
```

---

## Tailwind Config Extension

Add to `tailwind.config.ts`:

```typescript
export const config: Config = {
  // ... existing config ...
  theme: {
    extend: {
      // ... existing extends ...
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      },
      boxShadow: {
        'sm-lift': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'md-lift': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'lg-lift': '0 12px 32px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px rgba(196, 30, 58, 0.3)',
      },
      keyframes: {
        celebrate: {
          '0%': { transform: 'scale(0.8) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1.2) rotate(5deg)', opacity: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(196, 30, 58, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(196, 30, 58, 0.6)' },
        },
      },
      animation: {
        'celebrate': 'celebrate 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
};
```

---

## Usage Guidelines

### Always Use Design Tokens
```tsx
// ✅ Good
<div className="p-lg rounded-[2rem] shadow-md-lift border-primary/10">

// ❌ Avoid
<div className="p-6 rounded-24 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
```

### Consistent Spacing
```tsx
// ✅ Good - uses spacing scale
<div className="space-y-md">  {/* 1rem gap */}
  <Card />
  <Card />
</div>

// ❌ Avoid - random spacing
<div className="space-y-7">  {/* non-standard */}
```

### State Indicators
```tsx
// ✅ Good - clear state via color + styling
<div className="border-2 border-primary/10 shadow-sm hover:shadow-md-lift">

// ❌ Avoid - unclear state
<div className="border border-gray-300">
```

### Animation Best Practices
```tsx
// ✅ Good - purposeful, brief animation
whileHover={{ scale: 1.02 }}
transition={{ duration: 0.3 }}

// ❌ Avoid - sluggish or excessive
whileHover={{ scale: 1.2, rotate: 360 }}
transition={{ duration: 1 }}
```

---

## Progressive Disclosure: Songbook Design

### Problem
Users faced "paradox of choice" when presented with all carols at once, causing analysis paralysis.

### Solution: Smart Defaults with Progressive Disclosure

**Display 7 popular carols by default** (Miller's 7±2 cognitive load rule), with expandable section for remaining carols. Filters (search, energy, mood) apply across all visible carols.

### User Experience

```
Session Songbook
┌─────────────────────────────┐
│ [Search...] 🌙 ✨ ⚡        │  ← Filters
│             Traditional|Modern
└─────────────────────────────┘

Popular Carols (Most-loved by your guests)
├─ Jingle Bells (47 votes)
├─ Deck the Halls (42 votes)
├─ Silent Night (38 votes)
├─ Hark! The Herald Angels Sing (35 votes)
├─ O Come All Ye Faithful (32 votes)
├─ Joy to the World (28 votes)
└─ Angels We Have Heard on High (24 votes)

[+ View all 18 carols]  ← Expandable, collapsed by default
```

### Architecture

**Components:**
- **SongbookControls** – Search + Energy + Mood filter chips, "Clear all" button
- **PopularCarolsSection** – Top 7 carols sorted by votes
- **ExpandableCarolsSection** – Remaining carols, collapsed by default, smooth animation
- **CarolPlayer** – Orchestrates filtering, state management, routing

**Filtering Logic (AND logic):**
- Search: `carol.title` OR `carol.artist` (case-insensitive)
- Energy: exact match to `carol.energy` (low/medium/high)
- Mood:
  - Traditional: `carol.tags.includes('Traditional')` OR `carol.artist === 'Traditional'`
  - Modern: NOT traditional

**Performance:**
- `useMemo` for `filteredCarols` (recomputes only on data/filter change)
- `useMemo` for `popularCarolIds` (sorts only when filtered set changes)
- Lazy expansion (remaining carols only render when expanded)
- Client-side filtering (instant feedback, no API calls)

### Scaling Strategy

**Languages (Future):**
Add language filter chip—popular section auto-adapts to filtered results. No structural changes needed.

**Large Catalogs:**
7 popular + "View all X carols" pattern works indefinitely. As catalog grows, this prevents UI overwhelming.

### Files
- `app/components/carol/songbook-controls.tsx`
- `app/components/carol/popular-carols-section.tsx`
- `app/components/carol/expandable-carols-section.tsx`
- `app/components/carl-player.tsx` (updated)
