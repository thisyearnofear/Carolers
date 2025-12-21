/**
 * Lyrics sync engine
 * Pure functions for mapping playback time to lyrics state
 * 
 * Decoupled from playback implementation—works with any time source
 */

import type { Carol } from '@shared/schema';

export interface LyricsLine {
  index: number;
  text: string;
  type: 'lyric' | 'section' | 'direction';
  sectionLabel?: string;
  timing?: number; // ms from song start
  vocalParts?: Record<string, boolean>;
}

/**
 * Get the index of the highlighted line based on current playback time
 * 
 * If timing data is available (structured lyrics), use it.
 * Otherwise, estimate based on duration and line count.
 */
export function getHighlightedLineIndex(
  currentTimeMs: number,
  lyricsLines: LyricsLine[]
): number {
  if (!lyricsLines || lyricsLines.length === 0) return 0;

  // Find lines with timing data
  const timedLines = lyricsLines.filter(line => line.timing !== undefined);

  if (timedLines.length > 0) {
    // Use timing data: find the last line that starts before current time
    for (let i = timedLines.length - 1; i >= 0; i--) {
      if (timedLines[i].timing! <= currentTimeMs) {
        return timedLines[i].index;
      }
    }
    return 0;
  }

  // Fallback: estimate based on line count and duration
  // Assume lyrics are evenly distributed (naive, but works without timing data)
  // This is a placeholder—ideally Carol would have duration in ms
  return 0;
}

/**
 * Get upcoming lines to preview
 */
export function getUpcomingLines(
  currentLineIndex: number,
  lyricsLines: LyricsLine[],
  count: number
): LyricsLine[] {
  return lyricsLines.slice(
    currentLineIndex + 1,
    currentLineIndex + 1 + count
  );
}

/**
 * Get all past lines (for full-text modes)
 */
export function getPastLines(
  currentLineIndex: number,
  lyricsLines: LyricsLine[]
): LyricsLine[] {
  return lyricsLines.slice(0, currentLineIndex);
}

/**
 * Find the index of a section start (e.g., "Verse 2", "Chorus")
 */
export function findSectionIndex(
  lyricsLines: LyricsLine[],
  sectionLabel: string
): number {
  return lyricsLines.findIndex(
    line => line.type === 'section' && line.sectionLabel?.toLowerCase() === sectionLabel.toLowerCase()
  );
}

/**
 * Get all unique section labels
 */
export function getSectionLabels(lyricsLines: LyricsLine[]): string[] {
  const labels: string[] = [];
  for (const line of lyricsLines) {
    if (line.type === 'section' && line.sectionLabel && !labels.includes(line.sectionLabel)) {
      labels.push(line.sectionLabel);
    }
  }
  return labels;
}

/**
 * Parse simple lyrics array (legacy format) into LyricsLine structure
 * Used during migration—plain text lyrics → structured lyrics
 */
export function parseSimpleLyrics(simpleLyrics: string[]): LyricsLine[] {
  return simpleLyrics.map((text, index) => {
    const isSection = text.match(/^\[(.*?)\]$/);
    const isDirection = text.startsWith('(') && text.endsWith(')');

    let sectionLabel: string | undefined;
    if (isSection) {
      sectionLabel = isSection[1];
    }

    return {
      index,
      text: text,
      type: isSection ? 'section' : isDirection ? 'direction' : 'lyric',
      sectionLabel,
    };
  });
}

/**
 * Estimate scroll offset to keep current line centered in viewport
 * Assumes line height and container height are known
 */
export function getScrollOffset(
  currentLineIndex: number,
  containerHeightPx: number,
  lineHeightPx: number = 40
): number {
  // Center the current line: position it at 50% of viewport height
  const linePositionFromTop = currentLineIndex * lineHeightPx;
  const centerOffset = containerHeightPx / 2 - lineHeightPx / 2;
  return Math.max(0, linePositionFromTop - centerOffset);
}

/**
 * Calculate ideal line spacing in ms between lyrics
 * Based on song duration and line count
 */
export function estimateLineTiming(
  lyricsCount: number,
  durationMs: number
): number {
  return Math.floor(durationMs / lyricsCount);
}

/**
 * Format time in MM:SS for display
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
