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

  // Update internal state when props change
  useEffect(() => {
    setInternalCurrentTime(currentTime);
  }, [currentTime]);

  useEffect(() => {
    setInternalIsPlaying(isPlaying);
  }, [isPlaying]);

  // Compute highlighted line index based on current time
  const highlightedLineIndex = useMemo(() => {
    return getHighlightedLineIndex(internalCurrentTime, lyricsLines);
  }, [internalCurrentTime, lyricsLines]);

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

  // Parse duration from carol (format: "2:30")
  const getDuration = useCallback(() => {
    if (!carol.duration) return 0;
    const [minutes, seconds] = carol.duration.split(':').map(Number);
    return (minutes * 60 + seconds) * 1000; // Convert to ms
  }, [carol.duration]);

  // Format time helper
  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

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
    jumpToSection,
    toggleVocalPart,

    // Utilities
    formatTime,
    getDuration,
  };
}
