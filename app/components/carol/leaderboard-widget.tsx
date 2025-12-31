'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Heart } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface LeaderboardItem {
  id: string;
  title: string;
  likes: number;
  plays: number;
}

interface LeaderboardWidgetProps {
  limit?: number;
}

export function LeaderboardWidget({ limit = 5 }: LeaderboardWidgetProps) {
  const [carols, setCarols] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/carols/trending?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setCarols(data);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/5 rounded-[2rem] bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-primary/5 animate-pulse rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (carols.length === 0) {
    return (
      <Card className="border-primary/5 rounded-[2rem] bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-display text-primary">Trending Now</h3>
          </div>
          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="w-full px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load Leaderboard'}
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/5 rounded-[2rem] bg-gradient-to-b from-primary/5 to-transparent backdrop-blur-sm">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4 justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-display text-primary">Trending Now</h3>
          </div>
          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded font-medium transition-colors disabled:opacity-50"
            title="Refresh leaderboard"
          >
            {loading ? '...' : '↻'}
          </button>
        </div>

        <div className="space-y-2">
          {carols.map((carol, index) => (
            <motion.div
              key={carol.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors group cursor-pointer"
            >
              {/* Rank */}
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">
                  {index === 0 ? '🔥' : index === 1 ? '✨' : index === 2 ? '⭐' : index + 1}
                </span>
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-700 truncate group-hover:text-primary transition-colors">
                  {carol.title}
                </p>
              </div>

              {/* Metrics */}
              <Badge
                variant="secondary"
                className="bg-red-100/50 text-red-600 border-none text-[10px] font-bold px-2 py-0 h-5 whitespace-nowrap"
              >
                <Heart className="w-3 h-3 mr-1" />
                {carol.likes}
              </Badge>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-slate-500 text-center mt-4 pt-2 border-t border-primary/10">
          Updated daily • Based on community votes
        </p>
      </CardContent>
    </Card>
  );
}
