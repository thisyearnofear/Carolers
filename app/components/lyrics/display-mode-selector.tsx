/**
 * Display Mode Selector
 * 
 * Let users switch between karaoke, podcast, progressive, full modes
 */

'use client';

import { Button } from '../ui/button';
import { DISPLAY_MODES, type DisplayMode } from '@/lib/lyrics/display-modes';
import { Zap, Radio, Eye, BookOpen } from 'lucide-react';

interface DisplayModeSelectorProps {
  currentMode: DisplayMode;
  onModeChange: (mode: DisplayMode) => void;
}

const modeIcons: Record<DisplayMode, React.ReactNode> = {
  progressive: <Zap className="w-4 h-4" />,
  karaoke: <Radio className="w-4 h-4" />,
  podcast: <BookOpen className="w-4 h-4" />,
  full: <Eye className="w-4 h-4" />,
};

export function DisplayModeSelector({
  currentMode,
  onModeChange,
}: DisplayModeSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {(Object.keys(DISPLAY_MODES) as DisplayMode[]).map((mode) => {
        const config = DISPLAY_MODES[mode];
        const isActive = currentMode === mode;

        return (
          <Button
            key={mode}
            onClick={() => onModeChange(mode)}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            className={`flex gap-2 capitalize ${
              isActive
                ? 'bg-primary text-white'
                : 'bg-white/80 text-slate-700 hover:bg-white'
            }`}
            title={config.description}
          >
            {modeIcons[mode]}
            {mode}
          </Button>
        );
      })}
    </div>
  );
}
