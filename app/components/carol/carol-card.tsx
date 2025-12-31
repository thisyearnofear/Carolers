'use client';

import { motion } from 'framer-motion';
import { type Carol } from '@shared/schema';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ChevronRight, Heart, Eye } from 'lucide-react';

interface CarolCardProps {
  carol: Carol | {
    id: string;
    title: string;
    artist?: string;
    energy?: 'low' | 'medium' | 'high';
    tags?: string[];
    createdBy?: string;
    likes?: number;
    plays?: number;
  };
  onClick?: () => void;
  index?: number;
  showMetrics?: boolean;
  showCreator?: boolean;
}

export function CarolCard({
  carol,
  onClick,
  index = 0,
  showMetrics = false,
  showCreator = false,
}: CarolCardProps) {
  const energy = 'energy' in carol ? carol.energy : undefined;
  const artist = 'artist' in carol ? carol.artist : carol.createdBy ? `@${carol.createdBy.slice(0, 8)}` : 'Anonymous';
  const tags = 'tags' in carol ? carol.tags : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className="group overflow-hidden border-primary/5 hover:border-primary/20 transition-all duration-300 rounded-[2rem] bg-white/80 backdrop-blur-sm cursor-pointer hover:shadow-xl"
        onClick={onClick}
      >
        <CardContent className="p-6 flex items-center gap-6">
          {/* Avatar */}
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-display shadow-inner relative overflow-hidden group-hover:scale-105 transition-all duration-500 ${
              energy === 'high'
                ? 'bg-red-50 text-red-600'
                : energy === 'medium'
                  ? 'bg-yellow-50 text-yellow-600'
                  : 'bg-blue-50 text-blue-600'
            }`}
          >
            <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            {carol.title.charAt(0)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Energy + Tags */}
            <div className="flex flex-wrap gap-2 mb-2 items-center">
              {energy === 'high' && (
                <Badge className="bg-red-100/50 text-red-600 border-none text-[8px] h-4">
                  🔥 High Energy
                </Badge>
              )}
              {energy === 'medium' && (
                <Badge className="bg-yellow-100/50 text-yellow-600 border-none text-[8px] h-4">
                  ✨ Medium Energy
                </Badge>
              )}
              {energy === 'low' && (
                <Badge className="bg-blue-100/50 text-blue-600 border-none text-[8px] h-4">
                  🌙 Low Energy
                </Badge>
              )}
              {tags?.slice(0, 2).map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-primary/5 text-primary text-[10px] uppercase font-bold px-2 py-0 border-none h-4"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-display text-primary truncate group-hover:text-accent transition-colors">
              {carol.title}
            </h3>

            {/* Artist/Creator */}
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              {artist}
            </p>

            {/* Metrics */}
            {showMetrics && ('plays' in carol || 'likes' in carol) && (
              <div className="flex gap-3 mt-2 text-xs text-slate-500">
                {'plays' in carol && carol.plays !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {carol.plays}
                  </span>
                )}
                {'likes' in carol && carol.likes !== undefined && (
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {carol.likes}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Chevron */}
          <ChevronRight className="w-6 h-6 text-primary/20 group-hover:text-primary transition-colors pr-2" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
