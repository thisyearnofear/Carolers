import { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';

interface UseAmbianceAudioProps {
  src: string;
  volume: number;
  muted: boolean;
}

export function useAmbianceAudio({ src, volume, muted }: UseAmbianceAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const soundRef = useRef<Howl | null>(null);
  const isInitialized = useRef(false);

  // Initialize audio
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const sound = new Howl({
      src: [src],
      loop: true,
      volume: muted ? 0 : volume,
      onload: () => setIsReady(true),
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onloaderror: (id, err) => console.error('Error loading ambiance music:', err),
      onplayerror: (id, err) => {
        console.error('Error playing ambiance music:', err);
        setTimeout(() => {
          if (soundRef.current?.state() === 'unloaded') return;
          soundRef.current?.play();
        }, 100);
      }
    });

    soundRef.current = sound;

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
        soundRef.current = null;
      }
    };
  }, [src]);

  // Update volume
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(muted ? 0 : volume);
    }
  }, [volume, muted]);

  // Auto-play on first interaction
  useEffect(() => {
    if (!isReady || isPlaying) return;

    const handleFirstInteraction = () => {
      if (soundRef.current && !isPlaying) {
        soundRef.current.play();
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [isReady, isPlaying]);

  const togglePlay = () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  return {
    isPlaying,
    isReady,
    togglePlay,
  };
}
