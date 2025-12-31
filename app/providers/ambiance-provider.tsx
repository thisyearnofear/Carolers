'use client';

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { Howl } from 'howler';

interface AmbianceContextType {
  isPlaying: boolean;
  isReady: boolean;
  isMuted: boolean;
  volume: number;
  currentTrackId: string;
  togglePlay: () => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  setTrackId: (trackId: string) => void;
  loadTrack: (trackId: string, trackFile: string) => void;
}

const AmbianceContext = createContext<AmbianceContextType | undefined>(undefined);

interface AmbianceTrack {
  id: string;
  file: string;
}

interface AmbianceProviderProps {
  children: ReactNode;
  tracks: AmbianceTrack[];
  autoPlay?: boolean;
}

export function AmbianceProvider({
  children,
  tracks,
  autoPlay = false,
}: AmbianceProviderProps) {
  const howlRef = useRef<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.3);
  const initialTrackId = tracks.length > 0 ? tracks[0].id : '';
  const [currentTrackId, setCurrentTrackId] = useState(initialTrackId);
  const trackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Howl instance when track changes
  useEffect(() => {
    const track = tracks.find(t => t.id === currentTrackId);
    if (!track) return;

    // Clean up previous instance
    if (howlRef.current) {
      howlRef.current.stop();
      howlRef.current.unload();
    }

    // Reset ready state while loading
    setIsReady(false);

    // Create new Howl instance
    howlRef.current = new Howl({
      src: [track.file],
      volume: isMuted ? 0 : volume,
      loop: false, // Don't loop - will cycle through tracks instead
      onload: () => {
        setIsReady(true);
        if (autoPlay || isPlaying) {
          howlRef.current?.play();
        }
      },
      onend: () => {
        // Cycle to next track when current one finishes
        setTimeout(() => {
          const currentIndex = tracks.findIndex(t => t.id === currentTrackId);
          const nextIndex = (currentIndex + 1) % tracks.length;
          setCurrentTrackId(tracks[nextIndex].id);
        }, 0);
      },
      onplayerror: () => {
        console.error(`Failed to play track: ${track.file}`);
        setIsReady(false);
      },
    });

    return () => {
      if (trackTimeoutRef.current) {
        clearTimeout(trackTimeoutRef.current);
      }
    };
  }, [currentTrackId, tracks, autoPlay, isPlaying, isMuted, volume]);

  const togglePlay = () => {
    if (!howlRef.current || !isReady) return;

    if (howlRef.current.playing()) {
      howlRef.current.pause();
      setIsPlaying(false);
    } else {
      howlRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSetMuted = (muted: boolean) => {
    setIsMuted(muted);
    if (howlRef.current) {
      howlRef.current.mute(muted);
    }
  };

  const handleSetVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (howlRef.current) {
      howlRef.current.volume(isMuted ? 0 : newVolume);
    }
  };

  const handleSetTrackId = (trackId: string) => {
    // Stop current track
    if (howlRef.current) {
      howlRef.current.stop();
    }
    setCurrentTrackId(trackId);
    setIsPlaying(true);
  };

  const loadTrack = (trackId: string, trackFile: string) => {
    // Update tracks or just switch if already exists
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      handleSetTrackId(trackId);
    }
  };

  const value: AmbianceContextType = {
    isPlaying,
    isReady,
    isMuted,
    volume,
    currentTrackId,
    togglePlay,
    setMuted: handleSetMuted,
    setVolume: handleSetVolume,
    setTrackId: handleSetTrackId,
    loadTrack,
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
