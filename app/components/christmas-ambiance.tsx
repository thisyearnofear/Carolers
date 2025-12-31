'use client';

import { useState, useEffect } from 'react';
import { useAmbianceAudio } from '@/app/hooks/useAmbianceAudio';
import { useAmbiancePreferences } from '@/app/hooks/useAmbiancePreferences';
import { AmbianceCompact } from './ambiance/ambiance-compact';
import { AmbianceExpanded } from './ambiance/ambiance-expanded';

interface AmbianceTrack {
  id: string;
  name: string;
  file: string;
  description?: string;
}

const AMBIANCE_TRACKS: AmbianceTrack[] = [
  {
    id: 'snowfall',
    name: 'Snowfall',
    file: '/music/OnaE.mp3',
    description: 'Gentle winter atmosphere'
  },
];

export function ChristmasAmbiance() {
  const [isMobile, setIsMobile] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get preferences
  const {
    preferences,
    isLoaded,
    setVolume,
    setMuted,
    setExpanded,
  } = useAmbiancePreferences(isMobile);

  // Get current track
  const currentTrack = AMBIANCE_TRACKS.find(t => t.id === preferences.trackId) || AMBIANCE_TRACKS[0];

  // Get audio controls
  const { isPlaying, isReady, togglePlay } = useAmbianceAudio({
    src: currentTrack.file,
    volume: preferences.volume,
    muted: preferences.muted,
  });

  // Hydration check
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated || !isLoaded) {
    return null;
  }

  const showExpanded = preferences.expanded && !isMobile;

  return (
    <div className={`fixed z-[100] transition-all duration-300 ${
      isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'
    }`}>
      <div className={`bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-primary/20 transition-all duration-300 ${
        showExpanded 
          ? 'rounded-3xl p-4 w-80' 
          : 'p-3 flex items-center gap-2'
      }`}>
        {showExpanded ? (
          <AmbianceExpanded
            isPlaying={isPlaying}
            isReady={isReady}
            isMuted={preferences.muted}
            volume={preferences.volume}
            trackName={currentTrack.name}
            trackDescription={currentTrack.description}
            onTogglePlay={togglePlay}
            onToggleMute={() => setMuted(!preferences.muted)}
            onVolumeChange={setVolume}
            onToggleExpand={() => setExpanded(false)}
          />
        ) : (
          <AmbianceCompact
            isPlaying={isPlaying}
            isReady={isReady}
            isMuted={preferences.muted}
            volume={preferences.volume}
            onTogglePlay={togglePlay}
            onToggleMute={() => setMuted(!preferences.muted)}
            onVolumeChange={setVolume}
            onToggleExpand={() => setExpanded(true)}
            showVolumeSlider={!isMobile}
          />
        )}
      </div>
    </div>
  );
}
