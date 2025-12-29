'use client';

import { motion } from 'framer-motion';
import { Music, Clock, Zap } from 'lucide-react';
import { Badge } from '../ui/badge';

interface SetlistSong {
  title: string;
  artist?: string;
  duration?: string;
  energy?: string;
  tags?: string[];
}

interface SetlistCardProps {
  songs: SetlistSong[];
  theme?: string;
  totalDuration?: string;
  title?: string;
  description?: string;
  compact?: boolean;
  onSongClick?: (song: SetlistSong, index: number) => void;
  index?: number;
}

export function SetlistCard({
  songs,
  theme,
  totalDuration,
  title = 'Suggested Setlist',
  description,
  compact = false,
  onSongClick,
  index = 0
}: SetlistCardProps) {
  if (!songs.length) return null;

  const containerClass = compact
    ? 'space-y-2'
    : 'rounded-lg border border-primary/10 p-4 bg-white/50 space-y-4';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={containerClass}
    >
      {/* Header */}
      {!compact && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg text-primary">{title}</h3>
          </div>
          {description && (
            <p className="text-xs text-slate-600">{description}</p>
          )}
          {(theme || totalDuration) && (
            <div className="flex gap-3 pt-2">
              {theme && (
                <Badge variant="secondary" className="text-xs">
                  {theme}
                </Badge>
              )}
              {totalDuration && (
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <Clock className="w-3 h-3" />
                  {totalDuration}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Song List */}
      <div className="space-y-2">
        {songs.map((song, i) => (
          <motion.div
            key={`${song.title}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (index * 0.1) + (i * 0.05) }}
            onClick={() => onSongClick?.(song, i)}
            className={`p-3 rounded-md transition-all ${
              onSongClick
                ? 'cursor-pointer bg-slate-50 hover:bg-primary/5 border border-slate-200 hover:border-primary/30'
                : 'bg-slate-50 border border-slate-200'
            }`}
          >
            {/* Song number and title */}
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary flex-shrink-0">
                <span className="text-xs font-bold">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-slate-900 truncate">
                  {song.title}
                </div>
                {song.artist && (
                  <div className="text-xs text-slate-500 truncate">
                    {song.artist}
                  </div>
                )}
              </div>
            </div>

            {/* Metadata row */}
            {(song.energy || song.duration) && (
              <div className="flex gap-2 mt-2 ml-9 flex-wrap">
                {song.energy && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-sm bg-white text-[11px] font-medium text-slate-600 border border-slate-200">
                    <Zap className="w-2.5 h-2.5" />
                    <span className="capitalize">{song.energy}</span>
                  </div>
                )}
                {song.duration && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-sm bg-white text-[11px] font-medium text-slate-600 border border-slate-200">
                    <Clock className="w-2.5 h-2.5" />
                    {song.duration}
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {song.tags && song.tags.length > 0 && (
              <div className="flex gap-1 mt-2 ml-9 flex-wrap">
                {song.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Footer info */}
      {!compact && (
        <div className="text-xs text-slate-500 pt-2 border-t border-slate-200">
          {songs.length} song{songs.length !== 1 ? 's' : ''} selected
          {totalDuration && ` • Total: ${totalDuration}`}
        </div>
      )}
    </motion.div>
  );
}
