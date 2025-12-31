'use client';

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Howl } from 'howler';

interface AmbianceContextType {
  isPlaying: boolean;
  isReady: boolean;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  loadTrack: (src: string) => void;
  currentVolume: number;
  currentMuted: boolean;
}

const AmbianceContext = createContext<AmbianceContextType | undefined>(undefined);

export function AmbianceProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0.3);
  const [currentMuted, setCurrentMuted] = useState(false);

  const soundRef = useRef<Howl | null>(null);
  const isInitializedRef = useRef(false);
  const currentSrcRef = useRef<string>('');

  // Set up auto-play on first interaction (once at app level)
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const handleFirstInteraction = () => {
      if (soundRef.current && isReady) {
        soundRef.current.play();
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    // Cleanup on unmount (only at app level, rare)
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [isReady]);

  // Update volume whenever it changes
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(currentMuted ? 0 : currentVolume);
    }
  }, [currentVolume, currentMuted]);

  const togglePlay = () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  const loadTrack = (src: string) => {
    // Only reload if track changed
    if (currentSrcRef.current === src) return;
    currentSrcRef.current = src;

    const wasPlaying = isPlaying;
    
    // Unload old instance
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.unload();
    }
    
    // Create new Howl with the track
    const sound = new Howl({
      src: [src],
      loop: true,
      volume: currentMuted ? 0 : currentVolume,
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
    
    // Resume playback if it was playing
    if (wasPlaying) {
      setTimeout(() => {
        soundRef.current?.play();
      }, 100);
    }
  };

  const value: AmbianceContextType = {
    isPlaying,
    isReady,
    togglePlay,
    setVolume: setCurrentVolume,
    setMuted: setCurrentMuted,
    loadTrack,
    currentVolume,
    currentMuted,
  };

  return (
    <AmbianceContext.Provider value={value}>
      {children}
    </AmbianceContext.Provider>
  );
}

export function useAmbianceContext() {
  const context = useContext(AmbianceContext);
  if (!context) {
    throw new Error('useAmbianceContext must be used within AmbianceProvider');
  }
  return context;
}
