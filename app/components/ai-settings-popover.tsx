'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Key, 
  Zap, 
  ShieldCheck, 
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';
import { useAISettings, type AIProvider } from '@/store/use-ai-settings';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from './ui/dialog';

export function AISettingsPopover() {
  const { 
    provider, 
    geminiKey, 
    veniceKey, 
    useGemini3,
    setProvider,
    setGeminiKey,
    setVeniceKey,
    toggleGemini3
  } = useAISettings();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-primary h-9">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">AI Settings</span>
          {useGemini3 && <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Zap className="w-5 h-5" />
            </div>
            AI Intelligence Settings
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Provider Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Provider</label>
            <div className="grid grid-cols-2 gap-2">
              {(['gemini', 'venice'] as AIProvider[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`
                    flex items-center justify-between p-3 rounded-xl border-2 transition-all
                    ${provider === p ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}
                  `}
                >
                  <span className="text-sm font-bold capitalize">{p}</span>
                  {provider === p && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {provider === 'gemini' ? 'Gemini API Key' : 'Venice API Key'}
              </label>
              <a 
                href={provider === 'gemini' ? 'https://aistudio.google.com/app/apikey' : 'https://venice.ai/settings/api'} 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-primary flex items-center gap-1 hover:underline"
              >
                Get Key <ExternalLink className="w-2 h-2" />
              </a>
            </div>
            <div className="relative">
              <Input
                type="password"
                placeholder={provider === 'gemini' ? 'Enter Google AI Key...' : 'Enter Venice AI Key...'}
                value={provider === 'gemini' ? (geminiKey || '') : (veniceKey || '')}
                onChange={(e) => provider === 'gemini' ? setGeminiKey(e.target.value) : setVeniceKey(e.target.value)}
                className="pr-10 h-11 rounded-xl"
              />
              <Key className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 italic">
              <ShieldCheck className="w-3 h-3" />
              Your key is stored locally in your browser and never sent to our servers.
            </p>
          </div>

          {/* Gemini 3 Experimental Toggle */}
          <div className={`p-4 rounded-2xl border-2 transition-all ${useGemini3 ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Experimental Gemini 3 Pro</span>
                  <span className="text-[8px] bg-amber-500 text-white px-1 py-0.5 rounded font-bold uppercase">Judges Only</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  Unlocks native **Extended Thinking** and PhD-level musical reasoning. Requires a valid Gemini API Key with credits.
                </p>
              </div>
              <button 
                onClick={() => toggleGemini3(!useGemini3)}
                className={`
                  w-10 h-6 rounded-full transition-all relative flex items-center px-1
                  ${useGemini3 ? 'bg-amber-500' : 'bg-slate-300'}
                `}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-all ${useGemini3 ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Technical Note */}
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-[10px] text-blue-700 leading-relaxed">
            <p className="font-bold flex items-center gap-1 mb-1">
              <Info className="w-2.5 h-2.5" />
              Technical Note for Hackathon
            </p>
            Default mode uses Gemini 1.5 Flash (via system credits). Experimental Mode unlocks **Gemini 3 Pro** via BYOK to showcase deep reasoning benchmarks.
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={() => setIsOpen(false)} className="rounded-xl px-8">Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
