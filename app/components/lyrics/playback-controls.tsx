/**
 * Playback Controls
 * 
 * Time slider, play/pause, speed, font size, line spacing
 * All controls for customizing the viewing experience
 */

'use client';

import { Button } from '../ui/button';
import { Play, Pause, Volume2, Type, Minimize2 } from 'lucide-react';

interface PlaybackControlsProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  fontSize: number;
  lineSpacing: number;
  speed: number;
  onTimeChange: (time: number) => void;
  onPlayPause: () => void;
  onFontSizeChange: (size: number) => void;
  onLineSpacingChange: (spacing: number) => void;
}

export function PlaybackControls({
  currentTime,
  duration,
  isPlaying,
  fontSize,
  lineSpacing,
  speed,
  onTimeChange,
  onPlayPause,
  onFontSizeChange,
  onLineSpacingChange,
}: PlaybackControlsProps) {
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Time Slider */}
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={(e) => onTimeChange(parseInt(e.currentTarget.value))}
          step="100"
          className="w-full accent-primary cursor-pointer"
        />
        <div className="text-xs text-slate-500 text-right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Button Controls */}
      <div className="grid grid-cols-4 gap-2">
        {/* Play/Pause */}
        <Button
          onClick={onPlayPause}
          variant="outline"
          size="sm"
          className="flex gap-1"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Play</span>
            </>
          )}
        </Button>

        {/* Font Size */}
        <div className="flex items-center gap-1 px-2 bg-white/50 rounded-lg border border-slate-200">
          <Type className="w-4 h-4 text-slate-600" />
          <input
            type="range"
            min="0.8"
            max="1.5"
            step="0.1"
            value={fontSize}
            onChange={(e) => onFontSizeChange(parseFloat(e.target.value))}
            className="flex-1 w-full accent-primary cursor-pointer"
            title="Font size"
          />
          <span className="text-xs text-slate-600 w-6 text-right">
            {(fontSize * 100).toFixed(0)}%
          </span>
        </div>

        {/* Line Spacing */}
        <div className="flex items-center gap-1 px-2 bg-white/50 rounded-lg border border-slate-200">
          <Minimize2 className="w-4 h-4 text-slate-600" />
          <input
            type="range"
            min="0.8"
            max="1.5"
            step="0.1"
            value={lineSpacing}
            onChange={(e) => onLineSpacingChange(parseFloat(e.target.value))}
            className="flex-1 w-full accent-primary cursor-pointer"
            title="Line spacing"
          />
          <span className="text-xs text-slate-600 w-6 text-right">
            {(lineSpacing * 100).toFixed(0)}%
          </span>
        </div>

        {/* Speed (Placeholder) */}
        <div className="flex items-center gap-1 px-2 bg-white/50 rounded-lg border border-slate-200">
          <Volume2 className="w-4 h-4 text-slate-600" />
          <span className="text-xs text-slate-600">1x</span>
        </div>
      </div>
    </div>
  );
}
