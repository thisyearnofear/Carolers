'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Music, X } from 'lucide-react';
import { Button } from '../ui/button';
import { type Carol } from '@shared/schema';

interface LyricsModalProps {
  carol: Carol | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LyricsModal({ carol, open, onOpenChange }: LyricsModalProps) {
  if (!carol) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-green-800 truncate">{carol.title}</div>
              <div className="text-sm text-muted-foreground font-normal">{carol.artist}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {carol.lyrics && carol.lyrics.length > 0 ? (
            <div className="space-y-4">
              {carol.lyrics.map((line, index) => {
                const isChorus = line.toLowerCase().includes('chorus');
                const isEmpty = !line.trim();
                
                return (
                  <div
                    key={index}
                    className={`
                      ${isEmpty ? 'h-4' : ''}
                      ${isChorus ? 'font-semibold text-green-700 italic' : 'text-gray-700'}
                      ${!isEmpty && !isChorus ? 'leading-relaxed' : ''}
                    `}
                  >
                    {line || '\u00A0'}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No lyrics available for this carol.</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
