/**
 * Lyrics Display Component
 * 
 * Renders lyrics based on display mode and playback state
 * Uses getLineStyles() for consistent mode-based styling
 * Handles virtualization for large lyrics lists
 */

'use client';

import { useMemo, useRef, useEffect } from 'react';
import type { LyricsStateValue } from '@/hooks/useLyricsState';
import { getLineStyles, shouldShowLine, getModeBackgroundClass } from '@/lib/lyrics/display-modes';

interface LyricsDisplayProps {
  state: LyricsStateValue;
}

export function LyricsDisplay({ state }: LyricsDisplayProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef(new Map<number, HTMLDivElement>());

  // Auto-scroll to keep current line visible
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const currentLineElement = lineRefs.current.get(state.highlightedLineIndex);
    if (currentLineElement) {
      const modeConfig = state.displayMode === 'full' ? { autoScroll: false } : { autoScroll: true };
      
      if (modeConfig.autoScroll) {
        currentLineElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [state.highlightedLineIndex, state.displayMode]);

  const backgroundClass = useMemo(
    () => getModeBackgroundClass(state.displayMode),
    [state.displayMode]
  );

  if (state.lyricsLines.length === 0) {
    return (
      <div className={`${backgroundClass} flex-1 flex items-center justify-center`}>
        <div className="text-center text-slate-400">
          <p className="font-medium italic">No lyrics available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className={`${backgroundClass} p-8 space-y-2 overflow-y-auto`}
    >
      {state.lyricsLines.map((line) => {
        const shouldShow = shouldShowLine(
          line.index,
          state.highlightedLineIndex,
          state.displayMode
        );

        if (!shouldShow) return null;

        const isCurrent = line.index === state.highlightedLineIndex;
        const isSection = line.type === 'section';
        const isDirection = line.type === 'direction';

        // Section headers
        if (isSection) {
          return (
            <div
              key={line.index}
              ref={(el) => {
                if (el) lineRefs.current.set(line.index, el);
              }}
              className="text-xs font-bold text-slate-400/60 uppercase tracking-[0.15em] pt-4 first:pt-0"
            >
              {line.sectionLabel}
            </div>
          );
        }

        // Direction lines (in parentheses)
        if (isDirection) {
          const directionClass = isCurrent
            ? 'text-slate-300 italic font-medium'
            : 'text-slate-400 italic text-sm opacity-60';

          return (
            <div
              key={line.index}
              ref={(el) => {
                if (el) lineRefs.current.set(line.index, el);
              }}
              className={directionClass}
            >
              {line.text}
            </div>
          );
        }

        // Lyric lines
        const lineStyles = getLineStyles(
          line.index,
          state.highlightedLineIndex,
          state.displayMode,
          state.fontSize,
          state.lineSpacing
        );

        return (
          <div
            key={line.index}
            ref={(el) => {
              if (el) lineRefs.current.set(line.index, el);
            }}
            className={lineStyles}
          >
            {line.text}
          </div>
        );
      })}

      {/* Padding at bottom for scroll buffer */}
      <div className="h-32" />
    </div>
  );
}
