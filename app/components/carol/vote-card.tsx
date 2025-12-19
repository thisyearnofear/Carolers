'use client';

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Music, Eye, ThumbsUp, Heart } from 'lucide-react';
import { type Carol } from '@shared/schema';

interface VoteCardProps {
  carol: Carol;
  voted?: boolean;
  onVote: () => void;
  onViewLyrics?: () => void;
}

export function VoteCard({ carol, voted = false, onVote, onViewLyrics }: VoteCardProps) {
  const [showVoteAnimation, setShowVoteAnimation] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    setIsVoting(true);
    await onVote();
    setShowVoteAnimation(true);
    setTimeout(() => setShowVoteAnimation(false), 2000);
    setIsVoting(false);
  };

  // Get lyrics preview (first 2 non-empty lines, excluding chorus)
  const lyricsPreview = carol.lyrics
    ?.filter(line => line.trim() && !line.toLowerCase().includes('chorus'))
    .slice(0, 2)
    .join(' ') || 'No lyrics available';

  // Energy level for visual indicator
  const energyWidth = carol.energy === 'high' ? 'w-full' : 
                      carol.energy === 'medium' ? 'w-2/3' : 
                      'w-1/3';
  
  const energyColor = carol.energy === 'high' ? 'bg-red-500' : 
                      carol.energy === 'medium' ? 'bg-yellow-500' : 
                      'bg-green-500';

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      {/* Vote Animation */}
      {showVoteAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <Heart 
            className="w-16 h-16 text-red-500 animate-ping" 
            fill="currentColor"
          />
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Music Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
          <Music className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-lg text-green-800 truncate">
                {carol.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {carol.artist}
              </p>
            </div>
            
            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
              <ThumbsUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                {carol.votes || 0}
              </span>
            </div>
          </div>

          {/* Lyrics Preview */}
          {carol.lyrics && carol.lyrics.length > 0 && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {lyricsPreview}
            </p>
          )}

          {/* Duration */}
          <div className="text-xs text-muted-foreground mb-3">
            Duration: {carol.duration}
          </div>

          {/* Energy Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Energy</span>
              <span className="capitalize">{carol.energy}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full ${energyWidth} ${energyColor} rounded-full transition-all duration-300`} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {onViewLyrics && carol.lyrics && carol.lyrics.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewLyrics}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Lyrics
              </Button>
            )}
            
            <Button
              onClick={handleVote}
              disabled={voted || isVoting}
              size="sm"
              className={`flex-1 ${
                voted 
                  ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {voted ? (
                <>
                  <Heart className="w-4 h-4 mr-1" fill="currentColor" />
                  Voted
                </>
              ) : (
                <>
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {isVoting ? 'Voting...' : 'Vote'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
