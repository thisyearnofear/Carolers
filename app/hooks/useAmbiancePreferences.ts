import { useState, useEffect } from 'react';

interface AmbiancePreferences {
  volume: number;
  muted: boolean;
  trackId: string;
  expanded: boolean;
}

const STORAGE_KEYS = {
  VOLUME: 'carolers_ambiance_volume',
  MUTED: 'carolers_ambiance_muted',
  TRACK_ID: 'carolers_ambiance_track',
  EXPANDED: 'carolers_ambiance_expanded',
} as const;

const DEFAULTS: AmbiancePreferences = {
  volume: 0.3,
  muted: false,
  trackId: 'onae',
  expanded: false,
};

export function useAmbiancePreferences(isMobile: boolean) {
  const [preferences, setPreferences] = useState<AmbiancePreferences>(DEFAULTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved: Partial<AmbiancePreferences> = {
      volume: localStorage.getItem(STORAGE_KEYS.VOLUME)
        ? parseFloat(localStorage.getItem(STORAGE_KEYS.VOLUME)!)
        : DEFAULTS.volume,
      muted: localStorage.getItem(STORAGE_KEYS.MUTED)
        ? JSON.parse(localStorage.getItem(STORAGE_KEYS.MUTED)!)
        : DEFAULTS.muted,
      trackId: localStorage.getItem(STORAGE_KEYS.TRACK_ID) || DEFAULTS.trackId,
      expanded: isMobile ? false : (localStorage.getItem(STORAGE_KEYS.EXPANDED)
        ? JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPANDED)!)
        : DEFAULTS.expanded),
    };

    setPreferences(prev => ({ ...prev, ...saved }));
    setIsLoaded(true);
  }, [isMobile]);

  // Persist volume
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.VOLUME, preferences.volume.toString());
  }, [preferences.volume, isLoaded]);

  // Persist muted
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.MUTED, JSON.stringify(preferences.muted));
  }, [preferences.muted, isLoaded]);

  // Persist trackId
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TRACK_ID, preferences.trackId);
  }, [preferences.trackId, isLoaded]);

  // Persist expanded
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.EXPANDED, JSON.stringify(preferences.expanded));
  }, [preferences.expanded, isLoaded]);

  return {
    preferences,
    isLoaded,
    setVolume: (volume: number) => setPreferences(p => ({ ...p, volume })),
    setMuted: (muted: boolean) => setPreferences(p => ({ ...p, muted })),
    setTrackId: (trackId: string) => setPreferences(p => ({ ...p, trackId })),
    setExpanded: (expanded: boolean) => setPreferences(p => ({ ...p, expanded })),
  };
}
