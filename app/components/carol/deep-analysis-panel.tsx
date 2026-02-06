'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Music, 
  Globe, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Loader2,
  Info
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useAISettings } from '@/store/use-ai-settings';

interface DeepAnalysisPanelProps {
  carolTitle: string;
  carolArtist: string;
}

type AnalysisType = 'structure' | 'performance' | 'cultural' | 'harmony';

interface AnalysisResult {
  thinking: string;
  response: string;
  modelUsed?: string;
  providerUsed?: string;
}

export function DeepAnalysisPanel({ carolTitle, carolArtist }: DeepAnalysisPanelProps) {
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisType | null>(null);
  const [results, setResults] = useState<Record<AnalysisType, AnalysisResult>>({} as any);
  const [loading, setLoading] = useState<AnalysisType | null>(null);
  const [showThinking, setShowThinking] = useState<Record<AnalysisType, boolean>>({} as any);
  
  const settings = useAISettings();

  const performAnalysis = async (type: AnalysisType) => {
    if (results[type]) {
      setActiveAnalysis(type === activeAnalysis ? null : type);
      return;
    }

    setLoading(type);
    setActiveAnalysis(type);

    try {
      const response = await fetch('/api/carol-reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyzeCarolDeeply',
          args: { 
            title: carolTitle, 
            artist: carolArtist,
            type 
          },
          settings: {
            provider: settings.provider,
            geminiKey: settings.geminiKey,
            veniceKey: settings.veniceKey,
            useGemini3: settings.useGemini3
          }
        })
      });

      if (response.ok) {
        const { result: data } = await response.json();
        setResults(prev => ({ ...prev, [type]: data }));
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(null);
    }
  };

  const analysisTypes = [
    { id: 'structure', label: 'Musical Structure', icon: Music, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'performance', label: 'Performance Guide', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'cultural', label: 'Cultural Context', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'harmony', label: 'Harmony Guide', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="font-display text-xl text-primary">Intelligent Insights</h3>
        </div>
        <div className="flex items-center gap-2">
          {settings.useGemini3 ? (
            <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-black uppercase tracking-tighter border border-amber-200 flex items-center gap-1">
              <Zap className="w-2 h-2 fill-current" />
              Experimental Mode
            </span>
          ) : (
            <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-bold uppercase tracking-tighter border border-slate-200">
              Standard Mode
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {analysisTypes.map((type) => (
          <Button
            key={type.id}
            variant="outline"
            className={`h-auto py-4 px-4 justify-start gap-3 border-2 transition-all duration-300 relative overflow-hidden ${
              activeAnalysis === type.id 
                ? 'border-primary bg-primary/5 shadow-md ring-4 ring-primary/5' 
                : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50'
            }`}
            onClick={() => performAnalysis(type.id)}
            disabled={loading !== null && loading !== type.id}
          >
            {activeAnalysis === type.id && (
              <motion.div 
                layoutId="active-bg"
                className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" 
              />
            )}
            <div className={`p-2.5 rounded-xl transition-colors ${activeAnalysis === type.id ? 'bg-primary text-white' : `${type.bg} ${type.color}`}`}>
              {loading === type.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <type.icon className="w-5 h-5" />}
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-slate-900">{type.label}</div>
              <div className="text-[10px] text-slate-500 font-medium">Deep Reason</div>
            </div>
          </Button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeAnalysis && results[activeAnalysis] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 space-y-4"
          >
            {/* Analysis Result */}
            <Card className="p-6 border-slate-200 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden relative border-t-4 border-t-primary">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-0.5 rounded">
                    Result Trace: {results[activeAnalysis].modelUsed || 'Unknown'}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] h-7 gap-1.5 font-bold text-slate-500 hover:text-primary hover:bg-primary/5 rounded-full px-3"
                  onClick={() => setShowThinking(prev => ({ ...prev, [activeAnalysis]: !prev[activeAnalysis] }))}
                >
                  <Zap className={`w-3 h-3 ${showThinking[activeAnalysis] ? 'fill-primary text-primary' : ''}`} />
                  {showThinking[activeAnalysis] ? 'Hide Intelligence Trace' : 'Show Thinking Process'}
                </Button>
              </div>

              <div className="prose prose-sm max-w-none text-slate-700 font-medium">
                {results[activeAnalysis].response.split('\n').map((para, i) => (
                  para.trim() && <p key={i} className="mb-4 last:mb-0 leading-relaxed text-[15px]">{para}</p>
                ))}
              </div>
            </Card>

            {/* Thinking Process (The "Wow" Factor) */}
            <AnimatePresence>
              {showThinking[activeAnalysis] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] leading-relaxed border border-slate-800 shadow-2xl relative">
                    <div className="absolute top-0 right-0 p-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    <div className="flex items-center gap-2 mb-4 text-slate-500 border-b border-slate-800 pb-3">
                      <Loader2 className="w-3 h-3 animate-pulse" />
                      <span className="uppercase tracking-[0.2em] font-black text-[9px]">Neural Thinking Protocol: {results[activeAnalysis].providerUsed?.toUpperCase()} v3.0</span>
                    </div>
                    <div className="space-y-3 whitespace-pre-wrap opacity-90">
                      {results[activeAnalysis].thinking}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-center gap-2 py-4">
              <Info className="w-3 h-3 text-slate-400" />
              <p className="text-[10px] text-slate-400 font-medium italic">
                Advanced musical reasoning provided by {results[activeAnalysis].modelUsed}. Benchmarked at 81% MMMU-Pro.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
