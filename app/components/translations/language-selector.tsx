'use client';

import { useState } from 'react';
import { Loader2, Globe, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface LanguageSelectorProps {
  carolId: string;
  currentLanguage: string;
  onLanguageChange: (language: string, languageName: string) => void;
  isLoading?: boolean;
}

// ISO 639-1 codes with display names
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ru', name: 'Russian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'hi', name: 'Hindi' },
];

export function LanguageSelector({
  carolId,
  currentLanguage,
  onLanguageChange,
  isLoading = false,
}: LanguageSelectorProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentLang = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];
  const hasTranslation = currentLanguage !== 'en'; // Simplified; in production, check DB

  const handleLanguageSelect = async (code: string) => {
    const lang = LANGUAGES.find(l => l.code === code);
    if (!lang) return;

    setError(null);
    setGenerating(true);

    try {
      // Call API to get or generate translation
      const response = await fetch('/api/carols/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carolId,
          language: code,
          languageName: lang.name,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to load translation');
      }

      const data = await response.json();
      onLanguageChange(code, lang.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-secondary" />
        <label className="text-sm font-semibold text-slate-700">Language</label>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={currentLanguage}
          onValueChange={handleLanguageSelect}
          disabled={generating || isLoading}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(lang => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {generating && (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        )}

        {hasTranslation && !generating && (
          <Badge variant="secondary" className="text-xs">
            Available
          </Badge>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-2 bg-red-50 rounded-md text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
