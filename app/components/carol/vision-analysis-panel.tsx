'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSearch,
  Upload,
  Image as ImageIcon,
  Music,
  Users,
  Eye,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useAISettings } from '@/store/use-ai-settings';

interface VisionAnalysisPanelProps {
  carolId?: string;
  carolTitle?: string;
}

type AnalysisType = 'sheet_music' | 'cover_art' | 'performance';

export function VisionAnalysisPanel({ carolId, carolTitle }: VisionAnalysisPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('sheet_music');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const settings = useAISettings();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
      setError(null);
    }
  };

  const performAnalysis = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(selectedFile);
      const base64 = await base64Promise;

      const response = await fetch('/api/carols/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carolId,
          carolTitle,
          imageBase64: base64,
          imageMimeType: selectedFile.type,
          analysisType,
          settings: {
            provider: settings.provider,
            geminiKey: settings.geminiKey,
            veniceKey: settings.veniceKey,
            useGemini3: settings.useGemini3
          }
        })
      });

      if (!response.ok) throw new Error('Failed to analyze image');

      const data = await response.json();
      setResult(data.analysis);
    } catch (err) {
      console.error('Vision analysis error:', err);
      setError('Failed to analyze the image. Please try again with a different file.');
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { id: 'sheet_music', label: 'Sheet Music', icon: Music, desc: 'Read notation & vocal parts' },
    { id: 'cover_art', label: 'Cover Art', icon: ImageIcon, desc: 'Analyze cultural symbolism' },
    { id: 'performance', label: 'Performance', icon: Users, desc: 'Suggest staging & costumes' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-secondary/10">
          <FileSearch className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="font-display text-lg text-slate-900 leading-none">Multimodal Vision</h3>
          <p className="text-xs text-slate-500 mt-1">Image analysis with Gemini 3</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">1</div>
            <h4 className="text-sm font-semibold text-slate-700">Select Analysis Type</h4>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {types.map((type) => (
              <button
                key={type.id}
                onClick={() => setAnalysisType(type.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${analysisType === type.id
                    ? 'border-primary bg-gradient-to-br from-white to-primary/5 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm'
                  }`}
              >
                <div className={`p-2.5 rounded-lg transition-all ${analysisType === type.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                  }`}>
                  <type.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">{type.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{type.desc}</div>
                </div>
                {analysisType === type.id && (
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">2</div>
            <h4 className="text-sm font-semibold text-slate-700">Upload Image</h4>
          </div>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group
              ${previewUrl ? 'border-primary/50 shadow-md' : 'border-slate-300 hover:border-primary/40 hover:bg-slate-50'}
              flex flex-col items-center justify-center gap-3
            `}
          >
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-white mx-auto mb-2" />
                    <p className="text-white text-sm font-semibold">Change Image</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 rounded-full bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-900">Click to upload image</p>
                  <p className="text-xs text-slate-500 mt-1.5">PNG, JPG or WEBP • Max 5MB</p>
                </div>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
          </div>

          <Button
            className="w-full h-12 rounded-xl gap-2 font-semibold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            disabled={!selectedFile || loading}
            onClick={performAnalysis}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing with Gemini 3...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run Vision Analysis
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">3</div>
              <h4 className="text-sm font-semibold text-slate-700">Analysis Results</h4>
            </div>
            {result && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                Complete
              </span>
            )}
          </div>

          <Card className="min-h-[400px] bg-slate-50 border-2 border-slate-200 p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              {!result && !loading && !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center"
                >
                  <div className="p-4 rounded-full bg-slate-100 mb-4">
                    <Eye className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 max-w-[240px]">
                    Upload an image and run analysis to see AI-powered insights
                  </p>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center"
                >
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-7 h-7 text-primary animate-pulse" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">Gemini 3 is analyzing...</p>
                  <p className="text-xs text-slate-500 mt-2 max-w-[260px] mx-auto leading-relaxed">
                    Processing visual patterns and musical notation using high-resolution multimodal tokens
                  </p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-5 rounded-xl bg-red-50 border-2 border-red-100 flex gap-3 text-red-700"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold mb-1">Analysis Failed</p>
                    <p className="text-xs leading-relaxed">{error}</p>
                  </div>
                </motion.div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-sm prose-slate max-w-none"
                >
                  {result.split('\n').map((line, i) => {
                    const isHeading = line.startsWith('#') || line.startsWith('**');
                    const cleanLine = line.replace(/^[#\*]+\s*/, '').replace(/\*\*/g, '');

                    return line.trim() && (
                      <p key={i} className={`mb-3 leading-relaxed ${isHeading ? 'font-semibold text-slate-900 text-[15px]' : 'text-slate-700 text-sm'
                        }`}>
                        {cleanLine}
                      </p>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-blue-50 border-2 border-blue-100 text-blue-900">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="text-xs leading-relaxed space-y-2">
            <p className="font-semibold">Technical Implementation</p>
            <p>
              Gemini 3's native multimodal architecture (81% MMMU-Pro benchmark) enables direct interpretation of musical notation from images.
              We use <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[11px] font-mono">media_resolution: 'HIGH'</code> to ensure accurate recognition of fine details like note heads, stems, and accidentals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
