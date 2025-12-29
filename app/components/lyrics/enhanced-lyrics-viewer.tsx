/**
 * Enhanced Lyrics Viewer
 * 
 * Replaces the old LyricsModal with a rich, interactive experience.
 * Composes sub-components and manages the overall layout.
 * 
 * Props interface matches old LyricsModal for drop-in replacement.
 */

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Music, Info, X } from 'lucide-react';
import { type Carol, type CarolTranslation } from '@shared/schema';
import { useLyricsState } from '@/hooks/useLyricsState';
import { LyricsDisplay } from './lyrics-display';
import { PlaybackControls } from './playback-controls';
import { DisplayModeSelector } from './display-mode-selector';
import { SectionNavigator } from './section-navigator';
import { LanguageSelector } from '../translations/language-selector';
import { TranslationBadge } from '../translations/translation-badge';
import { Button } from '../ui/button';

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
  const [showCarolInfo, setShowCarolInfo] = useState(false);
  const [carolInfo, setCarolInfo] = useState<string | null>(null);
  const [loadingCarolInfo, setLoadingCarolInfo] = useState(false);

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

  const handleLanguageChange = async (language: string, languageName: string) => {
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
      setShowCarolInfo(!showCarolInfo);
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
        setShowCarolInfo(true);
      }
    } catch (err) {
      console.error('Failed to load carol info:', err);
    } finally {
      setLoadingCarolInfo(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-card-xl border-none shadow-2xl">
         {/* Header */}
         <DialogHeader className="p-lg bg-primary/5 border-b border-primary/5">
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

        {/* Controls Toolbar */}
         <div className="border-b border-primary/5 bg-white/30 p-4 space-y-3">
           {/* Carol Info Panel */}
           {showCarolInfo && carolInfo && (
             <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
               <div className="flex items-start justify-between gap-2">
                 <div className="flex items-center gap-2">
                   <Info className="w-4 h-4 text-primary flex-shrink-0" />
                   <h4 className="text-xs font-bold text-primary uppercase tracking-wider">About this Carol</h4>
                 </div>
                 <button
                   onClick={() => setShowCarolInfo(false)}
                   className="text-slate-400 hover:text-slate-600"
                 >
                   <X className="w-4 h-4" />
                 </button>
               </div>
               <p className="text-xs text-slate-700 leading-relaxed">{carolInfo}</p>
             </div>
           )}

           <div className="flex items-end justify-between gap-4">
             <div className="flex-1">
               <LanguageSelector
                 carolId={carol.id}
                 currentLanguage={selectedLanguage}
                 onLanguageChange={handleLanguageChange}
                 isLoading={loadingTranslation}
               />
             </div>

             <Button
               variant="ghost"
               size="sm"
               onClick={handleLoadCarolInfo}
               disabled={loadingCarolInfo}
               className="text-xs text-slate-500 hover:text-primary h-8 px-2"
               title="Learn about this carol"
             >
               <Info className="w-3 h-3 mr-1" />
               {loadingCarolInfo ? 'Loading...' : 'Info'}
             </Button>

             {translationInfo && selectedLanguage !== 'en' && (
               <div className="pb-0.5">
                 <TranslationBadge
                   source={translationInfo.source || 'ai_generated'}
                   upvotes={translationInfo.upvotes || 0}
                   downvotes={translationInfo.downvotes || 0}
                   isCanonical={translationInfo.isCanonical === 1}
                 />
               </div>
             )}
           </div>

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
          <LyricsDisplay
            state={state}
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-primary/5 text-center text-xs text-slate-400">
          {state.formatTime(state.currentTime)} / {state.formatTime(state.getDuration())}
        </div>
      </DialogContent>
    </Dialog>
  );
}
