/**
 * Enhanced Lyrics Viewer
 * 
 * Replaces the old LyricsModal with a rich, interactive experience.
 * Composes sub-components and manages the overall layout.
 * 
 * Props interface matches old LyricsModal for drop-in replacement.
 */

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Music } from 'lucide-react';
import { type Carol } from '@shared/schema';
import { useLyricsState } from '@/hooks/useLyricsState';
import { LyricsDisplay } from './lyrics-display';
import { PlaybackControls } from './playback-controls';
import { DisplayModeSelector } from './display-mode-selector';
import { SectionNavigator } from './section-navigator';

interface EnhancedLyricsViewerProps {
  carol: Carol | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Optional: if you have audio playback available
  currentTime?: number; // ms
  isPlaying?: boolean;
  onTimeChange?: (time: number) => void;
}

export function EnhancedLyricsViewer({
  carol,
  open,
  onOpenChange,
  currentTime = 0,
  isPlaying = false,
  onTimeChange,
}: EnhancedLyricsViewerProps) {
  if (!carol) return null;

  const state = useLyricsState({
    carol,
    currentTime,
    isPlaying,
    initialDisplayMode: 'progressive',
  });

  const handleTimeChange = (time: number) => {
    state.setCurrentTime(time);
    onTimeChange?.(time);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-card-xl border-none shadow-2xl">
         {/* Header */}
         <DialogHeader className="p-lg bg-primary/5 border-b border-primary/5">
           <DialogTitle className="flex items-center gap-md">
             <div className="w-12 h-12 rounded-card-sm bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
              <Music className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-display text-2xl text-primary truncate leading-tight">
                {carol.title}
              </div>
              <div className="text-xs font-bold text-secondary uppercase tracking-widest">
                {carol.artist}
              </div>
              {state.currentSection && (
                <div className="text-xs text-slate-500 mt-1">
                  {state.currentSection}
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Controls Toolbar */}
        <div className="border-b border-primary/5 bg-white/30 p-4 space-y-3">
          <DisplayModeSelector
            currentMode={state.displayMode}
            onModeChange={state.setDisplayMode}
          />

          <div className="flex gap-2">
            <SectionNavigator
              sections={state.sectionLabels}
              currentSection={state.currentSection}
              onSelectSection={state.jumpToSection}
            />
          </div>

          <PlaybackControls
            currentTime={state.currentTime}
            duration={state.getDuration()}
            isPlaying={state.isPlaying}
            fontSize={state.fontSize}
            lineSpacing={state.lineSpacing}
            speed={1} // TODO: implement speed control in useLyricsState
            onTimeChange={handleTimeChange}
            onPlayPause={() => state.setIsPlaying(!state.isPlaying)}
            onFontSizeChange={state.setFontSize}
            onLineSpacingChange={state.setLineSpacing}
          />
        </div>

        {/* Lyrics Display */}
        <div className="flex-1 overflow-y-auto">
          <LyricsDisplay
            state={state}
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-primary/5 text-center text-xs text-slate-400">
          {state.formatTime(state.currentTime)} / {state.formatTime(state.getDuration())}
        </div>
      </DialogContent>
    </Dialog>
  );
}
