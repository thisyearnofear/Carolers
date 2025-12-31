'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface TranslationOption {
  language: string;
  nativeLanguage: string;
  flag: string;
}

interface TranslationSuggestionsProps {
  carolId: string;
  currentLanguage: string;
  onLanguageSelect: (language: string, languageName?: string) => void | Promise<void>;
  isLoading?: boolean;
}

const AVAILABLE_LANGUAGES: TranslationOption[] = [
  { language: 'es', nativeLanguage: 'Spanish', flag: '🇪🇸' },
  { language: 'fr', nativeLanguage: 'French', flag: '🇫🇷' },
  { language: 'de', nativeLanguage: 'German', flag: '🇩🇪' },
  { language: 'it', nativeLanguage: 'Italian', flag: '🇮🇹' },
  { language: 'pt', nativeLanguage: 'Portuguese', flag: '🇵🇹' },
  { language: 'ja', nativeLanguage: 'Japanese', flag: '🇯🇵' },
  { language: 'zh', nativeLanguage: 'Chinese', flag: '🇨🇳' },
  { language: 'ko', nativeLanguage: 'Korean', flag: '🇰🇷' },
  { language: 'ru', nativeLanguage: 'Russian', flag: '🇷🇺' },
  { language: 'ar', nativeLanguage: 'Arabic', flag: '🇸🇦' },
];

export function TranslationSuggestions({
  carolId,
  currentLanguage,
  onLanguageSelect,
  isLoading
}: TranslationSuggestionsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Sing in Other Languages</h3>
          <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 text-[10px]">
            <Sparkles className="w-2 h-2 mr-1" />
            AI-Translated
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-6"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide' : 'Show'}
        </Button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-blue-50/30 border border-blue-100">
              {AVAILABLE_LANGUAGES.map((option) => (
                <button
                  key={option.language}
                  onClick={() => onLanguageSelect(option.language)}
                  disabled={isLoading}
                  className={`p-2 rounded-lg text-left transition-all text-sm font-medium ${
                    currentLanguage === option.language
                      ? 'bg-blue-500 text-white border border-blue-600'
                      : 'bg-white/80 text-slate-700 border border-blue-100 hover:bg-white hover:border-blue-300 disabled:opacity-50'
                  }`}
                >
                  <span className="text-lg mr-2">{option.flag}</span>
                  {option.nativeLanguage}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2 text-center">
              Translations powered by Gemini AI • Community improvements welcome
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
