'use client';

import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Play, Pause, ChevronUp, Music } from 'lucide-react';

interface AmbianceCompactProps {
  isPlaying: boolean;
  isReady: boolean;
  isMuted: boolean;
  volume: number;
  onTogglePlay: () => void;
  onToggleMute: (muted: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onToggleExpand: () => void;
  showVolumeSlider?: boolean;
}

export function AmbianceCompact({
  isPlaying,
  isReady,
  isMuted,
  volume,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onToggleExpand,
  showVolumeSlider = true,
}: AmbianceCompactProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Play/Pause */}
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full hover:bg-primary/10 flex-shrink-0"
        onClick={onTogglePlay}
        disabled={!isReady}
        aria-label={isPlaying ? 'Pause ambiance' : 'Play ambiance'}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5 text-primary animate-pulse" />
        ) : (
          <Play className="h-5 w-5 text-primary" />
        )}
      </Button>

      {/* Mute */}
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full hover:bg-primary/10 flex-shrink-0"
        onClick={() => onToggleMute(!isMuted)}
        aria-label={isMuted ? 'Unmute ambiance' : 'Mute ambiance'}
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5 text-slate-400" />
        ) : (
          <Volume2 className="h-5 w-5 text-primary" />
        )}
      </Button>

      {/* Now playing indicator */}
      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tight hidden sm:inline">
        🎵
      </span>

      {/* Volume slider */}
      {showVolumeSlider && (
        <div className="flex items-center gap-2 w-20 ml-1">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-primary/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            aria-label="Volume control"
          />
        </div>
      )}

      {/* Expand button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full hover:bg-primary/10 flex-shrink-0 ml-auto"
        onClick={onToggleExpand}
        aria-label="Expand ambiance panel"
      >
        <ChevronUp className="h-5 w-5 text-primary" />
      </Button>
    </div>
  );
}
