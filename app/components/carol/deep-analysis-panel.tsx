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
  Info,
  CheckCircle2
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
    { id: 'structure', label: 'Musical Structure', icon: Music, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-500/20' },
    { id: 'performance', label: 'Performance Guide', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-500/20' },
    { id: 'cultural', label: 'Cultural Context', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-500/20' },
    { id: 'harmony', label: 'Harmony Guide', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-500/20' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-xl text-slate-900 leading-none">Intelligent Insights</h3>
            <p className="text-xs text-slate-500 mt-1">Deep reasoning analysis</p>
          </div>
        </div>
        {settings.useGemini3 ? (
          <span className="text-xs bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 px-3 py-1.5 rounded-full font-semibold border border-amber-200 flex items-center gap-1.5 shadow-sm">
            <Zap className="w-3 h-3 fill-current" />
            Gemini 3
          </span>
        ) : (
          <span className="text-xs bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full font-medium border border-slate-200">
            Standard
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {analysisTypes.map((type) => (
          <Button
            key={type.id}
            variant="outline"
            className={`h-auto py-5 px-5 justify-start gap-4 border-2 transition-all duration-300 relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${activeAnalysis === type.id
              ? `border-primary/40 bg-gradient-to-br from-white to-primary/5 shadow-lg ring-2 ${type.ring}`
              : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-md'
              }`}
            onClick={() => performAnalysis(type.id)}
            disabled={loading !== null && loading !== type.id}
          >
            {activeAnalysis === type.id && (
              <motion.div
                layoutId="active-bg"
                className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"
              />
            )}
            <div className={`p-3 rounded-xl transition-all duration-300 ${activeAnalysis === type.id
              ? 'bg-primary text-white shadow-md'
              : `${type.bg} ${type.color} group-hover:scale-105`
              }`}>
              {loading === type.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <type.icon className="w-5 h-5" />}
            </div>
            <div className="text-left flex-1">
              <div className="text-sm font-semibold text-slate-900 leading-tight">{type.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">AI-powered analysis</div>
            </div>
            {results[type.id] && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute top-3 right-3" />
            )}
          </Button>
        ))}
      </div>
      {results[type.id] && (
        <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute top-3 right-3" />
      )}
      <div className="text-[10px] text-slate-500 font-medium">Deep Reason</div>
    </div>
          </Button >
        ))
}
      </div >

  <AnimatePresence mode="wait">
    {activeAnalysis && results[activeAnalysis] && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-5"
      >
        {/* Analysis Result */}
        <Card className="p-8 border-2 border-slate-200 shadow-lg bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />

          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                {results[activeAnalysis].modelUsed || 'AI Model'}
              </div>
              <div className="text-xs text-slate-400">•</div>
              <div className="text-xs text-slate-500 capitalize">
                {results[activeAnalysis].providerUsed || 'Provider'}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8 gap-2 font-medium text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={() => setShowThinking(prev => ({ ...prev, [activeAnalysis]: !prev[activeAnalysis] }))}
            >
              <Zap className={`w-3.5 h-3.5 transition-all ${showThinking[activeAnalysis] ? 'fill-primary text-primary' : ''}`} />
              {showThinking[activeAnalysis] ? 'Hide reasoning' : 'Show reasoning'}
            </Button>
          </div>

          <div className="prose prose-slate max-w-none">
            {results[activeAnalysis].response.split('\n').map((para, i) => (
              para.trim() && (
                <p key={i} className="mb-4 last:mb-0 leading-relaxed text-[15px] text-slate-700">
                  {para}
                </p>
              )
            ))}
          </div>
        </Card>

        {/* Thinking Process */}
        <AnimatePresence>
          {showThinking[activeAnalysis] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="p-6 bg-slate-950 border-2 border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
                  <div className="p-1.5 rounded-lg bg-slate-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-300">Reasoning Process</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {results[activeAnalysis].providerUsed?.toUpperCase()} • Internal thoughts
                    </div>
                  </div>
                </div>

                <div className="font-mono text-xs leading-relaxed text-emerald-400/90 whitespace-pre-wrap">
                  {results[activeAnalysis].thinking}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-600 leading-relaxed">
            Advanced musical reasoning powered by {results[activeAnalysis].modelUsed}.
            Performance benchmark: 81% on MMMU-Pro multimodal understanding tasks.
          </p>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
    </div >
  );
}
