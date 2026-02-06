import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIProvider = 'gemini' | 'venice';

interface AISettingsState {
  provider: AIProvider;
  geminiKey: string | null;
  veniceKey: string | null;
  useGemini3: boolean;
  
  // Actions
  setProvider: (provider: AIProvider) => void;
  setGeminiKey: (key: string | null) => void;
  setVeniceKey: (key: string | null) => void;
  toggleGemini3: (enabled: boolean) => void;
}

export const useAISettings = create<AISettingsState>()(
  persist(
    (set) => ({
      provider: 'gemini',
      geminiKey: null,
      veniceKey: null,
      useGemini3: false,

      setProvider: (provider) => set({ provider }),
      setGeminiKey: (geminiKey) => set({ geminiKey }),
      setVeniceKey: (veniceKey) => set({ veniceKey }),
      toggleGemini3: (useGemini3) => set({ useGemini3 }),
    }),
    {
      name: 'carolers-ai-settings',
    }
  )
);
