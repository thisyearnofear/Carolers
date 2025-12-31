/**
 * Display modes for lyrics rendering
 * Pure functions for computing styles and visibility by mode
 * 
 * Single source of truth for how lyrics appear in each mode
 */

export type DisplayMode = 'progressive' | 'karaoke' | 'podcast' | 'full';

export interface ModeConfig {
  showAll: boolean;
  highlightCurrent: boolean;
  previewUpcoming: number;
  autoScroll: boolean;
  layout: 'center' | 'left' | 'full';
  description: string;
}

export const DISPLAY_MODES: Record<DisplayMode, ModeConfig> = {
  progressive: {
    showAll: false,
    highlightCurrent: true,
    previewUpcoming: 2,
    autoScroll: true,
    layout: 'center',
    description: 'One line at a time, like a teleprompter',
  },
  karaoke: {
    showAll: true,
    highlightCurrent: true,
    previewUpcoming: 3,
    autoScroll: true,
    layout: 'center',
    description: 'Current line large and centered, upcoming faded',
  },
  podcast: {
    showAll: true,
    highlightCurrent: true,
    previewUpcoming: 0,
    autoScroll: true,
    layout: 'left',
    description: 'Full transcript with current line highlighted',
  },
  full: {
    showAll: true,
    highlightCurrent: true,
    previewUpcoming: 0,
    autoScroll: false,
    layout: 'full',
    description: 'All lyrics visible, simple highlighting',
  },
};

/**
 * Compute CSS classes for a single line based on mode and state
 */
export function getLineStyles(
  lineIndex: number,
  highlightedIndex: number,
  mode: DisplayMode,
  fontSize: number,
  lineSpacing: number
): string {
  const isCurrent = lineIndex === highlightedIndex;
  const isUpcoming = lineIndex > highlightedIndex && lineIndex <= highlightedIndex + 3;
  const isPast = lineIndex < highlightedIndex;

  const baseClasses = [
    'transition-all duration-200',
    `text-base`,
    `leading-relaxed`,
    'px-4',
  ];

  // Font size scaling
  const fontSizeClass = {
    0.8: 'text-sm',
    0.9: 'text-base',
    1: 'text-base',
    1.1: 'text-lg',
    1.2: 'text-lg',
    1.3: 'text-xl',
    1.4: 'text-xl',
    1.5: 'text-2xl',
  }[Math.round(fontSize * 10) / 10] || 'text-base';

  const lineSpacingClass = {
    0.8: 'my-1',
    0.9: 'my-1.5',
    1: 'my-2',
    1.1: 'my-2.5',
    1.2: 'my-3',
    1.3: 'my-3.5',
    1.4: 'my-4',
    1.5: 'my-5',
  }[Math.round(lineSpacing * 10) / 10] || 'my-2';

  baseClasses.push(fontSizeClass, lineSpacingClass);

  // Mode-specific styling
  switch (mode) {
    case 'progressive':
      if (isCurrent) {
        baseClasses.push('text-2xl md:text-3xl font-bold text-primary scale-105');
      } else if (isUpcoming) {
        baseClasses.push('text-sm text-slate-400 opacity-50');
      } else {
        baseClasses.push('hidden');
      }
      break;

    case 'karaoke':
      if (isCurrent) {
        baseClasses.push('text-2xl md:text-3xl font-bold text-primary scale-110 drop-shadow-lg');
      } else if (isUpcoming) {
        baseClasses.push('text-base text-slate-400 opacity-60');
      } else if (isPast) {
        baseClasses.push('text-sm text-slate-300 opacity-40');
      }
      break;

    case 'podcast':
      if (isCurrent) {
        baseClasses.push('text-base md:text-lg font-semibold text-primary bg-primary/10 rounded-lg px-4 py-2');
      } else {
        baseClasses.push('text-slate-700');
      }
      break;

    case 'full':
      if (isCurrent) {
        baseClasses.push('text-base font-semibold text-primary bg-yellow-100/50 rounded px-2 py-1');
      } else {
        baseClasses.push('text-slate-700');
      }
      break;
  }

  return baseClasses.join(' ');
}

/**
 * Determine if a line should be visible in this mode
 */
export function shouldShowLine(
  lineIndex: number,
  highlightedIndex: number,
  mode: DisplayMode
): boolean {
  const config = DISPLAY_MODES[mode];

  if (config.showAll) return true;

  // progressive mode: show current + upcoming
  if (lineIndex === highlightedIndex) return true;
  if (lineIndex > highlightedIndex && lineIndex <= highlightedIndex + config.previewUpcoming) {
    return true;
  }

  return false;
}

/**
 * Get background gradient for mode aesthetic
 */
export function getModeBackgroundClass(mode: DisplayMode): string {
  switch (mode) {
    case 'progressive':
      return 'bg-gradient-to-b from-slate-900/95 via-slate-800/90 to-slate-900/95 text-white';
    case 'karaoke':
      return 'bg-gradient-to-br from-purple-900/90 via-slate-800/85 to-indigo-900/90 text-white';
    case 'podcast':
      return 'bg-white/50 backdrop-blur-md text-slate-900';
    case 'full':
    default:
      return 'bg-white/50 backdrop-blur-md text-slate-900';
  }
}
