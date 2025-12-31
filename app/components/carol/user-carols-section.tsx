'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { type UserCarol } from '@shared/schema';
import { Music, Play, Heart, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface UserCarolsSectionProps {
  title?: string;
  limit?: number;
  showOnlyComplete?: boolean;
}

export function UserCarolsSection({
  title = 'Your Creations',
  limit = 6,
  showOnlyComplete = false,
}: UserCarolsSectionProps) {
  const { userId } = useAuth();
  const [carols, setCarols] = useState<UserCarol[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchCarols = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/carols`);
        if (response.ok) {
          const data = await response.json();
          const filtered = showOnlyComplete
            ? data.filter((c: UserCarol) => c.status === 'complete')
            : data;
          setCarols(filtered.slice(0, limit));
        }
      } catch (error) {
        console.error('Failed to fetch user carols:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarols();
  }, [userId, limit, showOnlyComplete]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-display text-primary">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-primary/5 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (carols.length === 0) {
    return (
      <div className="text-center py-12 bg-primary/5 rounded-3xl">
        <Music className="w-12 h-12 text-primary/20 mx-auto mb-4" />
        <h3 className="text-xl font-display text-primary mb-2">No carols yet</h3>
        <p className="text-slate-600">Create your first carol to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-display text-primary">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {carols.map((carol, index) => (
          <motion.div
            key={carol.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group overflow-hidden border-primary/5 hover:border-primary/20 transition-all duration-300 rounded-[2rem] bg-white/80 backdrop-blur-sm h-full">
              <CardContent className="p-6 space-y-4 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-display text-primary truncate group-hover:text-accent transition-colors">
                      {carol.title}
                    </h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">
                      {carol.genre} • {carol.style}
                    </p>
                  </div>
                  <StatusBadge status={carol.status || 'processing'} />
                </div>

                {/* Status-specific content */}
                {carol.status === 'processing' && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Generating...</span>
                  </div>
                )}

                {carol.status === 'error' && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 font-bold">
                      {carol.errorMessage || 'Generation failed'}
                    </p>
                  </div>
                )}

                {carol.status === 'complete' && carol.audioUrl && (
                  <div className="space-y-3">
                    {carol.imageUrl && (
                      <img
                        src={carol.imageUrl}
                        alt={carol.title}
                        className="w-full h-32 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    <audio
                      src={carol.audioUrl}
                      controls
                      className="w-full h-8 rounded-xl"
                      onPlay={() => setPlayingId(carol.id)}
                      onPause={() => setPlayingId(null)}
                    />

                    <div className="flex gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" /> {carol.plays}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {carol.likes}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2 mt-auto">
                  {carol.status === 'complete' && (
                    <Badge className="bg-green-100/50 text-green-600 border-none text-[10px] h-5">
                      ✓ Ready
                    </Badge>
                  )}
                  {carol.createdAt && (
                    <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] border-none h-5">
                      {new Date(carol.createdAt).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'processing':
      return (
        <Badge className="bg-yellow-100/50 text-yellow-600 border-none text-[10px] h-5">
          ⏳ Processing
        </Badge>
      );
    case 'complete':
      return (
        <Badge className="bg-green-100/50 text-green-600 border-none text-[10px] h-5">
          <CheckCircle className="w-3 h-3" /> Complete
        </Badge>
      );
    case 'error':
      return (
        <Badge className="bg-red-100/50 text-red-600 border-none text-[10px] h-5">
          ✗ Error
        </Badge>
      );
    default:
      return null;
  }
}
