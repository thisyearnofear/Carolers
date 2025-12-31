'use client';

import { Button } from '@/app/components/ui/button';
import { Volume2, VolumeX, Play, Pause, ChevronDown, Music } from 'lucide-react';

interface AmbianceExpandedProps {
  isPlaying: boolean;
  isReady: boolean;
  isMuted: boolean;
  volume: number;
  trackName: string;
  trackDescription?: string;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleExpand: () => void;
}

export function AmbianceExpanded({
  isPlaying,
  isReady,
  isMuted,
  volume,
  trackName,
  trackDescription,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onToggleExpand,
}: AmbianceExpandedProps) {
  return (
    <div className="space-y-4 mt-3 w-full">
      {/* Visual indicator - animated waveform */}
      <div className="flex items-center gap-1 h-6 justify-center">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`h-full w-1 rounded-full transition-all duration-100 ${
              isPlaying ? 'bg-primary animate-bounce' : 'bg-primary/30'
            }`}
            style={{
              animationDelay: isPlaying ? `${i * 0.05}s` : '0s',
              height: isPlaying ? `${30 + Math.random() * 40}%` : '50%',
            }}
          />
        ))}
      </div>

      {/* Track info */}
      <div className="bg-primary/5 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <Music className="h-4 w-4 text-primary flex-shrink-0" />
          <p className="font-semibold text-sm text-slate-700">
            {trackName}
          </p>
        </div>
        {trackDescription && (
          <p className="text-xs text-slate-500">{trackDescription}</p>
        )}
      </div>

      {/* Volume control */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">
          Volume: {Math.round(volume * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
          aria-label="Volume control"
        />
      </div>

      {/* Main controls */}
      <div className="flex gap-2">
        {/* Play/Pause */}
        <Button
          variant="outline"
          className="flex-1 gap-2 rounded-xl border-primary/20"
          onClick={onTogglePlay}
          disabled={!isReady}
          aria-label={isPlaying ? 'Pause ambiance' : 'Play ambiance'}
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Play
            </>
          )}
        </Button>

        {/* Mute */}
        <Button
          variant="outline"
          className="flex-1 gap-2 rounded-xl border-primary/20"
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute ambiance' : 'Mute ambiance'}
        >
          {isMuted ? (
            <>
              <VolumeX className="h-4 w-4" />
              Unmute
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4" />
              Mute
            </>
          )}
        </Button>

        {/* Collapse */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl hover:bg-primary/10"
          onClick={onToggleExpand}
          aria-label="Collapse ambiance panel"
        >
          <ChevronDown className="h-5 w-5 text-primary" />
        </Button>
      </div>

      {/* Status */}
      <div className="text-center text-xs text-slate-500">
        {!isReady && 'Loading...'}
        {isReady && isPlaying && '🎵 Playing'}
        {isReady && !isPlaying && 'Paused'}
      </div>
    </div>
  );
}
