// MODULAR: User preferences management
import { useState, useEffect } from 'react';

// CLEAN: Preferences interface
interface UserPreferences {
  vocalRange?: 'soprano' | 'alto' | 'tenor' | 'bass' | 'none';
  preferredThemes?: string[];
  notificationPreferences?: {
    email: boolean;
    push: boolean;
  };
}

// ENHANCEMENT FIRST: Preferences hook
export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('carolers_preferences');
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      setIsLoaded(true);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = (newPrefs: Partial<UserPreferences>) => {
    const updatedPrefs = { ...preferences, ...newPrefs };
    setPreferences(updatedPrefs);
    try {
      localStorage.setItem('carolers_preferences', JSON.stringify(updatedPrefs));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  // Update specific preference
  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    savePreferences({ [key]: value } as Partial<UserPreferences>);
  };

  return {
    preferences,
    isLoaded,
    savePreferences,
    updatePreference,
    // Convenience methods
    setVocalRange: (range: UserPreferences['vocalRange']) => 
      updatePreference('vocalRange', range),
    addPreferredTheme: (theme: string) => {
      const currentThemes = preferences.preferredThemes || [];
      if (!currentThemes.includes(theme)) {
        updatePreference('preferredThemes', [...currentThemes, theme]);
      }
    },
    removePreferredTheme: (theme: string) => {
      const currentThemes = preferences.preferredThemes || [];
      updatePreference('preferredThemes', 
        currentThemes.filter(t => t !== theme)
      );
    },
  };
}

// CLEAN: Default preferences
export const defaultPreferences: UserPreferences = {
  vocalRange: 'none',
  preferredThemes: ['Christmas', 'Hanukkah'],
  notificationPreferences: {
    email: true,
    push: true,
  },
};

// MODULAR: Vocal range options
export const vocalRangeOptions = [
  { value: 'soprano', label: 'Soprano', emoji: '🎤', description: 'Highest vocal range' },
  { value: 'alto', label: 'Alto', emoji: '🎵', description: 'Lower female range' },
  { value: 'tenor', label: 'Tenor', emoji: '🎶', description: 'Higher male range' },
  { value: 'bass', label: 'Bass', emoji: '🎼', description: 'Lowest vocal range' },
  { value: 'none', label: 'Not sure', emoji: '🤷', description: 'Prefer not to specify' },
];

// MODULAR: Theme options
export const themeOptions = [
  'Christmas',
  'Hanukkah',
  'Easter',
  'New Year',
  'Birthday',
  'Wedding',
  'General',
];

export type { UserPreferences };