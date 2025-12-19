import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Printer, Music, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { type Carol } from '@shared/schema';
import { useState, useEffect } from 'react';
import { useCelebration, celebrationTriggers } from './Celebration';

interface LyricsModalProps {
  carol: Carol | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LyricsModal({ carol, isOpen, onClose }: LyricsModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);
  const { triggerCelebration } = useCelebration();

  // Simulate loading for demo purposes
  useEffect(() => {
    if (carol && isOpen) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setShowAnimation(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [carol, isOpen]);

  if (!carol) return null;

  const handlePrint = () => {
    window.print();
    triggerCelebration(celebrationTriggers.actionSuccess('Lyrics ready for printing!'));
  };

  const handleShare = () => {
    const text = `🎵 "${carol.title}" by ${carol.artist}\n\n${carol.lyrics?.join('\n') || 'No lyrics'}`;
    if (navigator.share) {
      navigator.share({
        title: carol.title,
        text: text,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-40 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20 px-6 py-4 flex items-start justify-between">
              <div className="flex-1">
                <h2 className="font-display text-2xl font-bold text-foreground">{carol.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">by {carol.artist}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-primary/10 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto px-6 py-8 space-y-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                      <Music className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                  <p className="text-muted-foreground mb-2">Loading lyrics...</p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                  >
                    <span className="text-2xl">🎵</span>
                  </motion.div>
                </div>
              ) : (
                <>
                  {/* Energy & Tags */}
                  <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    carol.energy === 'high'
                      ? 'bg-accent/20 text-accent'
                      : carol.energy === 'medium'
                        ? 'bg-secondary/20 text-secondary'
                        : 'bg-primary/20 text-primary'
                  }`}
                >
                  {carol.energy} energy
                </span>
                {carol.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
                {carol.duration && (
                  <span className="px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                    {carol.duration}
                  </span>
                )}
              </div>

              {/* Lyrics */}
              <div className="space-y-4">
                {carol.lyrics?.length && carol.lyrics.length > 0 ? (
                  carol.lyrics.map((line: string, idx: number) => {
                    // Simple heuristic: blank lines are verse/section breaks
                    const isBlank = line.trim() === '';
                    const isChorus =
                      line.toLowerCase().includes('chorus') ||
                      line.toLowerCase().includes('refrain') ||
                      line.toLowerCase().includes('[chorus]') ||
                      line.toLowerCase().includes('(chorus)');

                    return (
                      <div
                        key={idx}
                        className={`text-lg leading-relaxed transition-colors ${
                          isBlank
                            ? 'h-2'
                            : isChorus
                              ? 'text-accent font-semibold bg-accent/5 p-3 rounded-lg italic'
                              : 'text-foreground'
                        }`}
                      >
                        {!isBlank && line}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No lyrics available yet for this carol.</p>
                    <p className="text-sm mt-2">Help us build the library by contributing!</p>
                  </div>
                )}
              </div>
            </>
            )}
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-primary/20 px-6 py-4 flex gap-2 justify-end print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button onClick={onClose} size="sm">
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
