import { useEffect } from 'react';
import { useAmbianceContext } from '@/app/providers/ambiance-provider';

interface UseAmbianceAudioProps {
  src: string;
  volume: number;
  muted: boolean;
}

/**
 * Hook to sync track changes and preferences with the global ambiance context.
 * The context manages the Howl instance lifecycle, this hook just syncs state.
 */
export function useAmbianceAudio({ src, volume, muted }: UseAmbianceAudioProps) {
  const context = useAmbianceContext();

  // Load track when src changes
  useEffect(() => {
    context.loadTrack(src);
  }, [src, context]);

  // Sync volume to context
  useEffect(() => {
    context.setVolume(volume);
  }, [volume, context]);

  // Sync muted to context
  useEffect(() => {
    context.setMuted(muted);
  }, [muted, context]);

  return {
    isPlaying: context.isPlaying,
    isReady: context.isReady,
    togglePlay: context.togglePlay,
  };
}
