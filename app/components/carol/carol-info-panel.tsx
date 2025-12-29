'use client';

import { useState } from 'react';
import { type Carol } from '@shared/schema';
import { Music, Info } from 'lucide-react';
import { Button } from '../ui/button';

interface CarolInfoPanelProps {
  carol: Carol;
  info?: string; // Optional AI-generated info
  onInfoLoad?: (info: string) => void;
  compact?: boolean; // For use in lyrics viewer (minimal)
}

export function CarolInfoPanel({
  carol,
  info,
  onInfoLoad,
  compact = false
}: CarolInfoPanelProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localInfo, setLocalInfo] = useState<string | null>(info || null);

  const handleLoadInfo = async () => {
    if (localInfo) {
      setShowInfo(!showInfo);
      return;
    }

    setLoading(true);
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
        const { info: newInfo } = await response.json();
        setLocalInfo(newInfo);
        setShowInfo(true);
        onInfoLoad?.(newInfo);
      }
    } catch (error) {
      console.error('Failed to load carol info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLoadInfo}
        disabled={loading}
        className="text-xs text-slate-500 hover:text-primary h-auto p-0"
      >
        <Info className="w-3 h-3 mr-1" />
        {loading ? 'Loading...' : 'About'}
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg text-primary truncate">
            {carol.title}
          </h3>
          <p className="text-xs text-slate-500 truncate">
            {carol.artist}
          </p>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Music className="w-4 h-4" />
        </div>
      </div>

      {/* Info Section */}
      {localInfo ? (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs text-slate-700 leading-relaxed">
            {localInfo}
          </p>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-[11px] text-primary/60 hover:text-primary mt-2 font-medium"
          >
            {showInfo ? 'Hide' : 'Show'} details
          </button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleLoadInfo}
          disabled={loading}
          className="w-full text-xs h-8"
        >
          {loading ? 'Loading carol info...' : 'Learn about this carol'}
        </Button>
      )}

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        {carol.energy && (
          <div className="px-2 py-1.5 rounded-md bg-slate-100 text-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Energy</div>
            <div className="text-xs font-bold text-slate-700 capitalize">{carol.energy}</div>
          </div>
        )}
        {carol.duration && (
          <div className="px-2 py-1.5 rounded-md bg-slate-100 text-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Duration</div>
            <div className="text-xs font-bold text-slate-700">{carol.duration}</div>
          </div>
        )}
      </div>
    </div>
  );
}
