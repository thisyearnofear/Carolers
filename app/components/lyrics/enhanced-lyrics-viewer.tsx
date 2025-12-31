/**
 * Enhanced Lyrics Viewer
 * 
 * Replaces the old LyricsModal with a rich, interactive experience.
 * Composes sub-components and manages the overall layout.
 * 
 * Props interface matches old LyricsModal for drop-in replacement.
 */

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Music, Info, X, Sparkles, BookOpen } from 'lucide-react';
import { type Carol, type CarolTranslation } from '@shared/schema';
import { useLyricsState } from '@/hooks/useLyricsState';
import { LyricsDisplay } from './lyrics-display';
import { PlaybackControls } from './playback-controls';
import { DisplayModeSelector } from './display-mode-selector';
import { SectionNavigator } from './section-navigator';
import { LanguageSelector } from '../translations/language-selector';
import { TranslationBadge } from '../translations/translation-badge';
import { CarolInsightsPanel } from './carol-insights-panel';
import { TranslationSuggestions } from './translation-suggestions';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface EnhancedLyricsViewerProps {
  carol: Carol | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Optional: if you have audio playback available
  currentTime?: number; // ms
  isPlaying?: boolean;
  onTimeChange?: (time: number) => void;
}

export function EnhancedLyricsViewer({
  carol,
  open,
  onOpenChange,
  currentTime = 0,
  isPlaying = false,
  onTimeChange,
}: EnhancedLyricsViewerProps) {
  if (!carol) return null;

  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translationInfo, setTranslationInfo] = useState<CarolTranslation | null>(null);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [carolInfo, setCarolInfo] = useState<string | null>(null);
  const [loadingCarolInfo, setLoadingCarolInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<'lyrics' | 'insights'>('lyrics');

  // Use either translated or original carol
  const displayCarol = selectedLanguage === 'en' || !translationInfo
    ? carol
    : { ...carol, title: translationInfo.title, lyrics: translationInfo.lyrics || carol.lyrics };

  const state = useLyricsState({
    carol: displayCarol,
    currentTime,
    isPlaying,
    initialDisplayMode: 'progressive',
  });

  const handleTimeChange = (time: number) => {
    state.setCurrentTime(time);
    onTimeChange?.(time);
  };

  const handleLanguageChange = async (language: string, languageName?: string) => {
    setSelectedLanguage(language);
    
    // Fetch translation metadata when language changes
    try {
      setLoadingTranslation(true);
      const response = await fetch(`/api/carols/translate?carolId=${carol.id}&language=${language}`);
      if (response.ok) {
        const data = await response.json();
        setTranslationInfo(data.translation);
      } else {
        // No translation metadata available (first request)
        setTranslationInfo(null);
      }
    } catch (err) {
      console.error('Failed to fetch translation metadata:', err);
    } finally {
      setLoadingTranslation(false);
    }
  };

  const handleLoadCarolInfo = async () => {
    if (carolInfo) {
      return;
    }

    setLoadingCarolInfo(true);
    try {
      const response = await fetch('/api/carol-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: carol.title,
          artist: carol.artist
        })
      });
      
      if (response.ok) {
        const { info } = await response.json();
        setCarolInfo(info);
      }
    } catch (err) {
      console.error('Failed to load carol info:', err);
    } finally {
      setLoadingCarolInfo(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-card-xl border-none shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-lg bg-gradient-to-r from-primary/10 to-accent/5 border-b border-primary/10">
          <DialogTitle className="flex items-center gap-md">
            <div className="w-12 h-12 rounded-card-sm bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
              <Music className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-display text-2xl text-primary truncate leading-tight">
                {carol.title}
              </div>
              <div className="text-xs font-bold text-secondary uppercase tracking-widest">
                {carol.artist}
              </div>
              {state.currentSection && (
                <div className="text-xs text-slate-500 mt-1">
                  {state.currentSection}
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'lyrics' | 'insights')} className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="w-full justify-start rounded-none border-b border-primary/10 bg-white/50 p-0 h-auto gap-0">
            <TabsTrigger 
              value="lyrics"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-4 py-3 text-sm font-bold"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Lyrics
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-4 py-3 text-sm font-bold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          {/* Lyrics Tab */}
          <TabsContent value="lyrics" className="flex flex-col flex-1 overflow-hidden m-0">
            {/* Lyrics Controls */}
            <div className="p-4 bg-white/50 border-b border-primary/5 space-y-3 overflow-y-auto">
              <DisplayModeSelector
                currentMode={state.displayMode}
                onModeChange={state.setDisplayMode}
              />

              <div className="flex gap-2">
                <SectionNavigator
                  sections={state.sectionLabels}
                  currentSection={state.currentSection}
                  onSelectSection={state.jumpToSection}
                />
              </div>

              <PlaybackControls
                currentTime={state.currentTime}
                duration={state.getDuration()}
                isPlaying={state.isPlaying}
                fontSize={state.fontSize}
                lineSpacing={state.lineSpacing}
                speed={state.speed}
                onTimeChange={handleTimeChange}
                onPlayPause={() => state.setIsPlaying(!state.isPlaying)}
                onSpeedChange={state.setSpeed}
                onFontSizeChange={state.setFontSize}
                onLineSpacingChange={state.setLineSpacing}
              />
            </div>

            {/* Lyrics Display */}
            <div className="flex-1 overflow-y-auto">
              <LyricsDisplay state={state} />
            </div>

            {/* Footer */}
            <div className="p-3 bg-white border-t border-primary/5 text-center text-xs text-slate-400">
              {state.formatTime(state.currentTime)} / {state.formatTime(state.getDuration())}
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="flex flex-col flex-1 overflow-hidden m-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <CarolInsightsPanel
                title={carol.title}
                artist={carol.artist}
                carolInfo={carolInfo}
                isLoading={loadingCarolInfo}
                onLoadInsight={handleLoadCarolInfo}
              />

              <TranslationSuggestions
                carolId={carol.id}
                currentLanguage={selectedLanguage}
                onLanguageSelect={handleLanguageChange}
                isLoading={loadingTranslation}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
