'use client';

import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Play, Pause, ChevronDown, Music } from 'lucide-react';

interface AmbianceTrack {
  id: string;
  name: string;
}

interface AmbianceExpandedProps {
  isPlaying: boolean;
  isReady: boolean;
  isMuted: boolean;
  volume: number;
  trackName: string;
  trackDescription?: string;
  artist?: string;
  provenance?: string;
  availableTracks?: AmbianceTrack[];
  currentTrackId?: string;
  onTrackChange?: (trackId: string) => void;
  onTogglePlay: () => void;
  onToggleMute: (muted: boolean) => void;
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
  artist,
  provenance,
  availableTracks,
  currentTrackId,
  onTrackChange,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onToggleExpand,
}: AmbianceExpandedProps) {
  return (
    <div className="space-y-3 w-full">
      {/* Visual indicator - compact waveform */}
      <div className="flex items-center gap-1 h-4 justify-center">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`h-full w-0.5 rounded-full transition-all duration-100 ${
              isPlaying ? 'bg-primary animate-bounce' : 'bg-primary/30'
            }`}
            style={{
              animationDelay: isPlaying ? `${i * 0.05}s` : '0s',
              height: isPlaying ? `${30 + Math.random() * 40}%` : '50%',
            }}
          />
        ))}
      </div>

      {/* Track Selector */}
      {availableTracks && availableTracks.length > 1 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600 block">Select Ambiance</label>
          <div className="flex gap-2">
            {availableTracks.map((track) => (
              <button
                key={track.id}
                onClick={() => onTrackChange?.(track.id)}
                className={`flex-1 px-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  currentTrackId === track.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white/50 text-slate-700 border border-primary/10 hover:bg-white hover:border-primary/30'
                }`}
              >
                {track.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Track info - compact */}
      <div className="bg-primary/5 rounded-lg p-2 space-y-1">
        <div className="flex items-start gap-2">
          <Music className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-semibold text-xs text-slate-700 truncate">
              {trackName}
            </p>
            {artist && (
              <p className="text-[11px] text-slate-600 truncate">by {artist}</p>
            )}
          </div>
        </div>
        {trackDescription && (
          <p className="text-[11px] text-slate-500 italic line-clamp-2 pl-5">{trackDescription}</p>
        )}
        {provenance && (
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tight block pl-5">
            {provenance}
          </span>
        )}
      </div>

      {/* Volume control - compact */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-slate-600">
          Volume: {Math.round(volume * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-primary/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
          aria-label="Volume control"
        />
      </div>

      {/* Main controls - compact */}
      <div className="flex gap-2 pt-1">
        {/* Play/Pause */}
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 rounded-lg border-primary/20 text-xs h-8"
          onClick={onTogglePlay}
          disabled={!isReady}
          aria-label={isPlaying ? 'Pause ambiance' : 'Play ambiance'}
        >
          {isPlaying ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Pause</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Play</span>
            </>
          )}
        </Button>

        {/* Mute */}
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 rounded-lg border-primary/20 text-xs h-8"
          onClick={() => onToggleMute(!isMuted)}
          aria-label={isMuted ? 'Unmute ambiance' : 'Mute ambiance'}
        >
          {isMuted ? (
            <>
              <VolumeX className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Unmute</span>
            </>
          ) : (
            <>
              <Volume2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mute</span>
            </>
          )}
        </Button>

        {/* Collapse */}
        <Button
          variant="ghost"
          size="sm"
          className="rounded-lg hover:bg-primary/10 h-8 w-8 p-0"
          onClick={onToggleExpand}
          aria-label="Collapse ambiance panel"
        >
          <ChevronDown className="h-4 w-4 text-primary" />
        </Button>
      </div>

      {/* Status */}
      <div className="text-center text-[10px] text-slate-500 pt-1">
        {!isReady && 'Loading...'}
        {isReady && isPlaying && '🎵 Now playing'}
        {isReady && !isPlaying && '⏸ Paused'}
      </div>
    </div>
  );
}
