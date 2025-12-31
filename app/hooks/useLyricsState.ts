/**
 * Central state hook for lyrics playback and display
 * 
 * Single source of truth for:
 * - Current highlighted line
 * - Display mode
 * - Playback controls (speed, size, spacing)
 * - Auto-scroll state
 * 
 * Separates concerns: this hook manages state, components use it for rendering
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Carol } from '@shared/schema';
import {
  getHighlightedLineIndex,
  getUpcomingLines,
  getPastLines,
  getSectionLabels,
  parseSimpleLyrics,
  formatTime,
  parseDurationMs,
  type LyricsLine,
} from '@/lib/lyrics/sync';
import { DISPLAY_MODES, type DisplayMode } from '@/lib/lyrics/display-modes';

export interface UseLyricsStateOptions {
  carol: Carol;
  currentTime?: number; // ms, defaults to 0
  isPlaying?: boolean;
  initialDisplayMode?: DisplayMode;
}

export interface LyricsStateValue {
  // Carol data
  carol: Carol;
  lyricsLines: LyricsLine[];

  // Playback state
  currentTime: number;
  isPlaying: boolean;
  highlightedLineIndex: number;
  speed: number; // 0.5 - 2.0

  // Display configuration
  displayMode: DisplayMode;
  fontSize: number; // 0.8 - 1.5
  lineSpacing: number; // 0.8 - 1.5
  showVocalParts: boolean;
  selectedVocalParts: Set<string>;

  // Computed display data
  upcomingLines: LyricsLine[];
  pastLines: LyricsLine[];
  sectionLabels: string[];
  currentSection?: string;

  // Controls
  setDisplayMode: (mode: DisplayMode) => void;
  setFontSize: (size: number) => void;
  setLineSpacing: (spacing: number) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  jumpToSection: (sectionLabel: string) => void;
  toggleVocalPart: (part: string) => void;

  // Utilities
  formatTime: (ms: number) => string;
  getDuration: () => number; // Total song duration in ms
}

export function useLyricsState({
  carol,
  currentTime = 0,
  isPlaying = false,
  initialDisplayMode = 'progressive',
}: UseLyricsStateOptions): LyricsStateValue {
  // Parse lyrics once at init
  const lyricsLines = useMemo(() => {
    if (!carol.lyrics || carol.lyrics.length === 0) return [];
    return parseSimpleLyrics(carol.lyrics as string[]);
  }, [carol.lyrics]);

  // Display state
  const [displayMode, setDisplayMode] = useState<DisplayMode>(initialDisplayMode);
  const [fontSize, setFontSize] = useState(1);
  const [lineSpacing, setLineSpacing] = useState(1);
  const [showVocalParts, setShowVocalParts] = useState(false);
  const [selectedVocalParts, setSelectedVocalParts] = useState<Set<string>>(new Set());

  // Playback state (controlled by parent)
  const [internalCurrentTime, setInternalCurrentTime] = useState(currentTime);
  const [internalIsPlaying, setInternalIsPlaying] = useState(isPlaying);
  const [speed, setSpeed] = useState(1);

  // Update internal state when props change
  useEffect(() => {
    setInternalCurrentTime(currentTime);
  }, [currentTime]);

  useEffect(() => {
    setInternalIsPlaying(isPlaying);
  }, [isPlaying]);

  // Duration calculation
  const durationMs = useMemo(() => {
    return parseDurationMs(carol.duration);
  }, [carol.duration]);

  const getDuration = useCallback(() => durationMs, [durationMs]);

  // Internal playback timer (speed-adjusted)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (internalIsPlaying) {
      interval = setInterval(() => {
        setInternalCurrentTime(prev => {
          const next = prev + (100 * speed);
          const duration = getDuration();
          if (next >= duration) {
            setInternalIsPlaying(false);
            return duration;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [internalIsPlaying, getDuration, speed]);

  // Compute highlighted line index based on current time
  const highlightedLineIndex = useMemo(() => {
    return getHighlightedLineIndex(internalCurrentTime, lyricsLines, getDuration());
  }, [internalCurrentTime, lyricsLines, getDuration]);

  // Compute upcoming and past lines based on display mode
  const upcomingLines = useMemo(() => {
    const config = DISPLAY_MODES[displayMode];
    return getUpcomingLines(highlightedLineIndex, lyricsLines, config.previewUpcoming);
  }, [highlightedLineIndex, lyricsLines, displayMode]);

  const pastLines = useMemo(() => {
    return getPastLines(highlightedLineIndex, lyricsLines);
  }, [highlightedLineIndex, lyricsLines]);

  // Get unique section labels
  const sectionLabels = useMemo(() => {
    return getSectionLabels(lyricsLines);
  }, [lyricsLines]);

  // Get current section
  const currentSection = useMemo(() => {
    if (highlightedLineIndex >= 0 && highlightedLineIndex < lyricsLines.length) {
      // Find the most recent section before current line
      for (let i = highlightedLineIndex; i >= 0; i--) {
        if (lyricsLines[i].type === 'section') {
          return lyricsLines[i].sectionLabel;
        }
      }
    }
    return undefined;
  }, [highlightedLineIndex, lyricsLines]);

  // Jump to section
  const jumpToSection = useCallback(
    (sectionLabel: string) => {
      const sectionIndex = lyricsLines.findIndex(
        line => line.type === 'section' && line.sectionLabel?.toLowerCase() === sectionLabel.toLowerCase()
      );
      if (sectionIndex !== -1 && lyricsLines[sectionIndex].timing) {
        setInternalCurrentTime(lyricsLines[sectionIndex].timing!);
      }
    },
    [lyricsLines]
  );

  // Toggle vocal part filter
  const toggleVocalPart = useCallback((part: string) => {
    setSelectedVocalParts(prev => {
      const next = new Set(prev);
      if (next.has(part)) {
        next.delete(part);
      } else {
        next.add(part);
      }
      return next;
    });
  }, []);

  return {
    // Data
    carol,
    lyricsLines,

    // Playback state
    currentTime: internalCurrentTime,
    isPlaying: internalIsPlaying,
    highlightedLineIndex,
    speed: Math.max(0.5, Math.min(2.0, speed)),

    // Display config
    displayMode,
    fontSize: Math.max(0.8, Math.min(1.5, fontSize)),
    lineSpacing: Math.max(0.8, Math.min(1.5, lineSpacing)),
    showVocalParts,
    selectedVocalParts,

    // Computed data
    upcomingLines,
    pastLines,
    sectionLabels,
    currentSection,

    // Controls
    setDisplayMode,
    setFontSize,
    setLineSpacing,
    setCurrentTime: setInternalCurrentTime,
    setIsPlaying: setInternalIsPlaying,
    setSpeed,
    jumpToSection,
    toggleVocalPart,

    // Utilities
    formatTime,
    getDuration,
  };
}
