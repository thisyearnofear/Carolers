/**
 * Enhanced Lyrics Viewer
 *
 * Replaces the old LyricsModal with a rich, interactive experience.
 * Composes sub-components and manages the overall layout.
 *
 * Props interface matches old LyricsModal for drop-in replacement.
 */

"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Music, Info, X, Sparkles, BookOpen } from "lucide-react";
import { type Carol, type CarolTranslation } from "@shared/schema";
import { useLyricsState } from "@/hooks/useLyricsState";
import { LyricsDisplay } from "./lyrics-display";
import { PlaybackControls } from "./playback-controls";
import { DisplayModeSelector } from "./display-mode-selector";
import { SectionNavigator } from "./section-navigator";
import { LanguageSelector } from "../translations/language-selector";
import { TranslationBadge } from "../translations/translation-badge";
import { TranslationSuggestions } from "./translation-suggestions";
import { CarolCompanion } from "../carol/carol-companion";
import { DeepAnalysisPanel } from "../carol/deep-analysis-panel";
import { VisionAnalysisPanel } from "../carol/vision-analysis-panel";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";

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

  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [translationInfo, setTranslationInfo] =
    useState<CarolTranslation | null>(null);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [activeTab, setActiveTab] = useState<"lyrics" | "insights">("lyrics");

  // Use either translated or original carol
  const displayCarol =
    selectedLanguage === "en" || !translationInfo
      ? carol
      : {
          ...carol,
          title: translationInfo.title,
          lyrics: translationInfo.lyrics || carol.lyrics,
        };

  const state = useLyricsState({
    carol: displayCarol,
    currentTime,
    isPlaying,
    initialDisplayMode: "progressive",
  });

  const handleTimeChange = (time: number) => {
    state.setCurrentTime(time);
    onTimeChange?.(time);
  };

  const handleLanguageChange = async (
    language: string,
    languageName?: string,
  ) => {
    setSelectedLanguage(language);

    // Fetch translation metadata when language changes
    try {
      setLoadingTranslation(true);
      const response = await fetch(
        `/api/carols/translate?carolId=${carol.id}&language=${language}`,
      );
      if (response.ok) {
        const data = await response.json();
        setTranslationInfo(data.translation);
      } else {
        // No translation metadata available (first request)
        setTranslationInfo(null);
      }
    } catch (err) {
      console.error("Failed to fetch translation metadata:", err);
    } finally {
      setLoadingTranslation(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] overflow-hidden flex flex-col p-0 rounded-card-xl border-none shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-lg bg-gradient-to-r from-primary/10 to-accent/5 border-b border-primary/10 flex-shrink-0">
          <DialogTitle className="flex items-center gap-md">
            <div className="w-12 h-12 rounded-card-sm bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
              <Music className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <DialogTitle className="font-display text-2xl text-primary truncate leading-tight">
                {carol.title}
              </DialogTitle>
              <DialogDescription className="text-xs font-bold text-secondary uppercase tracking-widest">
                {carol.artist}
              </DialogDescription>
              {state.currentSection && (
                <div className="text-xs text-slate-500 mt-1">
                  {state.currentSection}
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "lyrics" | "insights")}
          className="flex flex-col flex-1 overflow-hidden min-h-0"
        >
          <TabsList className="w-full justify-center rounded-none border-b border-primary/10 bg-white/50 p-0 h-auto gap-0 flex-shrink-0">
            <TabsTrigger
              value="lyrics"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-4 py-3 text-sm font-bold"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Lyrics
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-4 py-3 text-sm font-bold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          {/* Lyrics Tab */}
          <TabsContent
            value="lyrics"
            className="flex flex-col flex-1 overflow-hidden m-0 min-h-0 data-[state=active]:flex"
          >
            {/* Lyrics Controls */}
            <div className="p-4 bg-white/50 border-b border-primary/5 space-y-3 flex-shrink-0">
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
            <ScrollArea className="flex-1 min-h-0 bg-slate-50/30">
              <LyricsDisplay state={state} />
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 bg-white border-t border-primary/5 text-center text-xs text-slate-400 flex-shrink-0">
              {state.formatTime(state.currentTime)} /{" "}
              {state.formatTime(state.getDuration())}
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent
            value="insights"
            className="flex-1 m-0 overflow-hidden flex flex-col min-h-0 data-[state=active]:flex"
          >
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6 space-y-12">
                <section>
                  <CarolCompanion
                    carolTitle={carol.title}
                    carolArtist={carol.artist}
                  />
                </section>

                <section className="pt-6 border-t border-primary/5">
                  <DeepAnalysisPanel
                    carolTitle={carol.title}
                    carolArtist={carol.artist}
                  />
                </section>

                <section className="pt-6 border-t border-primary/5">
                  <VisionAnalysisPanel
                    carolId={carol.id}
                    carolTitle={carol.title}
                  />
                </section>

                <section className="pt-6 border-t border-primary/5">
                  <TranslationSuggestions
                    carolId={carol.id}
                    currentLanguage={selectedLanguage}
                    onLanguageSelect={handleLanguageChange}
                    isLoading={loadingTranslation}
                  />
                </section>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
