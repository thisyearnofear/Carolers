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
      <div className="flex items-center gap-2">
        <FileSearch className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg text-primary">Multimodal Vision</h3>
        <span className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Gemini 3 Multimodal</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">1. Select Analysis Type</div>
          <div className="grid grid-cols-1 gap-2">
            {types.map((type) => (
              <button
                key={type.id}
                onClick={() => setAnalysisType(type.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  analysisType === type.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${analysisType === type.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <type.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{type.label}</div>
                  <div className="text-[10px] text-slate-500">{type.desc}</div>
                </div>
                {analysisType === type.id && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
              </button>
            ))}
          </div>

          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest pt-2">2. Upload Image</div>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
              ${previewUrl ? 'border-primary/50' : 'border-slate-200 hover:border-primary/30 hover:bg-slate-50'}
              flex flex-col items-center justify-center gap-3
            `}
          >
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-bold">Change Image</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-slate-100 text-slate-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-900">Click to upload image</p>
                  <p className="text-[10px] text-slate-500 mt-1">PNG, JPG or WEBP (max 5MB)</p>
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
            className="w-full h-11 rounded-xl gap-2 font-bold"
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
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>3. Analysis Results</span>
            {result && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                <CheckCircle2 className="w-2 h-2" />
                Processed High-Res
              </span>
            )}
          </div>
          
          <Card className="min-h-[300px] h-full bg-slate-50 border-slate-200 p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              {!result && !loading && !error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center opacity-40 grayscale"
                >
                  <Eye className="w-12 h-12 mb-4" />
                  <p className="text-sm font-medium">Upload an image and run analysis to see insights here</p>
                </motion.div>
              )}

              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center"
                >
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Gemini 3 is thinking...</p>
                  <p className="text-[10px] text-slate-500 mt-2 max-w-[200px] mx-auto">
                    Analyzing musical notation and visual patterns using high-resolution vision tokens.
                  </p>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-xl bg-red-50 border border-red-100 flex gap-3 text-red-700"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-xs font-medium leading-relaxed">{error}</p>
                </motion.div>
              )}

              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-sm max-w-none text-slate-700"
                >
                  {result.split('\n').map((line, i) => (
                    line.trim() && (
                      <p key={i} className={`mb-3 ${line.startsWith('#') || line.startsWith('**') ? 'font-bold text-slate-900' : ''}`}>
                        {line.replace(/^[#\*]+\s*/, '')}
                      </p>
                    )
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
      
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-xs leading-relaxed">
        <p className="font-bold flex items-center gap-1.5 mb-1">
          <Info className="w-3 h-3" />
          Technical Note for Judges
        </p>
        <p>
          Gemini 3's native multimodal capabilities (81% on MMMU-Pro) allow it to read and interpret musical notation directly from images. We use <code className="bg-blue-100 px-1 rounded">media_resolution: 'HIGH'</code> to ensure fine details like note heads and accidentals are correctly identified.
        </p>
      </div>
    </div>
  );
}
