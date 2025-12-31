'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, ChevronDown, Loader } from 'lucide-react';
import { Button } from '../ui/button';

interface DeepAnalysisPanelProps {
  carolTitle: string;
  carolArtist: string;
}

interface AnalysisResult {
  thinking: string;
  analysis: string;
  analysisType: string;
}

type AnalysisType = 'composition' | 'performance' | 'cultural' | 'harmony';

const ANALYSIS_TYPES: { id: AnalysisType; label: string; icon: string; description: string }[] = [
  {
    id: 'composition',
    label: 'Musical Structure',
    icon: '🎼',
    description: 'Harmonic analysis & melodic insight'
  },
  {
    id: 'performance',
    label: 'Performance Guide',
    icon: '🎤',
    description: 'Vocal range, difficulty & technique'
  },
  {
    id: 'cultural',
    label: 'Cultural Context',
    icon: '🌍',
    description: 'History & traditions'
  },
  {
    id: 'harmony',
    label: 'Harmony Guide',
    icon: '🎵',
    description: 'Voice parts & arrangement tips'
  }
];

export function DeepAnalysisPanel({ carolTitle, carolArtist }: DeepAnalysisPanelProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisType | null>(null);
  const [results, setResults] = useState<Record<AnalysisType, AnalysisResult | null>>({
    composition: null,
    performance: null,
    cultural: null,
    harmony: null
  });
  const [loading, setLoading] = useState<AnalysisType | null>(null);
  const [showThinking, setShowThinking] = useState<AnalysisType | null>(null);

  const handleAnalyze = async (type: AnalysisType) => {
    // Return cached result if available
    if (results[type]) {
      setSelectedAnalysis(type);
      return;
    }

    setLoading(type);
    try {
      const response = await fetch('/api/carols/deep-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: carolTitle,
          artist: carolArtist,
          analysisType: type
        })
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setResults(prev => ({
        ...prev,
        [type]: {
          thinking: data.thinking,
          analysis: data.analysis,
          analysisType: type
        }
      }));
      setSelectedAnalysis(type);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(null);
    }
  };

  const currentResult = selectedAnalysis ? results[selectedAnalysis] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-primary/10">
        <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-primary">Deep Analysis with Gemini 3</h3>
          <p className="text-xs text-slate-500">Extended thinking for expert-level insights</p>
        </div>
      </div>

      {/* Analysis Type Buttons Grid */}
      <div className="grid grid-cols-2 gap-2">
        {ANALYSIS_TYPES.map((type) => (
          <motion.button
            key={type.id}
            onClick={() => handleAnalyze(type.id)}
            disabled={loading === type.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 rounded-lg text-left transition-all border-2 ${
              selectedAnalysis === type.id
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-primary/10 bg-white/50 hover:border-primary/30'
            } ${loading === type.id ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{type.icon}</span>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-700 leading-tight">{type.label}</h4>
                <p className="text-[11px] text-slate-500 truncate">{type.description}</p>
              </div>
            </div>
            {loading === type.id && (
              <div className="mt-2 flex gap-1">
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                <div
                  className="w-1 h-1 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-1 h-1 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Analysis Result Panel */}
      <AnimatePresence mode="wait">
        {currentResult && (
          <motion.div
            key={`analysis-${selectedAnalysis}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-primary/10">
              {/* Thinking Process Section */}
              <div className="space-y-2">
                <motion.button
                  onClick={() => setShowThinking(showThinking === selectedAnalysis ? null : selectedAnalysis)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-white/50 hover:bg-white transition-colors border border-violet-200"
                >
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-bold text-violet-900">Gemini 3 Reasoning</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showThinking === selectedAnalysis ? 'rotate-180' : ''
                    }`}
                  />
                </motion.button>

                <AnimatePresence>
                  {showThinking === selectedAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 bg-white rounded-lg border border-violet-200/50 text-xs text-slate-600 font-mono space-y-2 max-h-40 overflow-y-auto">
                        <p className="text-violet-700 font-bold">💭 Model's Internal Reasoning:</p>
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-600">
                          {currentResult.thinking}
                        </p>
                        <p className="text-[10px] text-slate-400 italic">
                          This thinking process (extended thinking in Gemini 3) helps the model reason deeply through complex musical and cultural analysis.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Main Analysis */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Analysis Result
                </h4>
                <div className="p-4 bg-white rounded-lg border border-primary/10 text-sm text-slate-700 space-y-3 leading-relaxed">
                  {currentResult.analysis.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Info Note */}
              <div className="p-2 bg-violet-100/50 rounded-lg border border-violet-200 text-xs text-violet-700">
                <p className="font-semibold mb-1">🔬 About this analysis:</p>
                <p>Generated using Gemini 3 Pro's extended thinking capabilities. This model performs deep reasoning to provide expert-level musical and cultural insights.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call to Action */}
      {!currentResult && (
        <div className="p-4 rounded-lg bg-violet-50 border border-violet-200 text-center">
          <p className="text-sm text-slate-600 mb-3">
            Click an analysis type above to explore this carol with AI-powered reasoning
          </p>
          <p className="text-xs text-slate-500">
            Uses Gemini 3's extended thinking to reason through complex musical and cultural analysis
          </p>
        </div>
      )}
    </div>
  );
}
