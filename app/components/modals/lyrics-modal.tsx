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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-card-xl border-none shadow-2xl">
         <DialogHeader className="p-lg bg-primary/5 border-b border-primary/5">
           <DialogTitle className="flex items-center gap-md">
             <div className="w-12 h-12 rounded-card-sm bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
              <Music className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-display text-2xl text-primary truncate leading-tight">{carol.title}</div>
              <div className="text-xs font-bold text-secondary uppercase tracking-widest">{carol.artist}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 bg-white/50 backdrop-blur-md">
          {carol.lyrics && carol.lyrics.length > 0 ? (
            <div className="space-y-6 text-center">
              {carol.lyrics.map((line, index) => {
                const isChorusHeader = line.toLowerCase().includes('[chorus]');
                const isVerseHeader = line.toLowerCase().includes('[verse');
                const isEmpty = !line.trim();

                if (isChorusHeader || isVerseHeader) {
                  return (
                    <div key={index} className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.3em] pt-4 first:pt-0">
                      {line.replace('[', '').replace(']', '')}
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className={`
                      ${isEmpty ? 'h-2' : ''}
                      ${line.startsWith('(') ? 'text-slate-400 italic text-base' : 'text-slate-800 text-xl md:text-2xl font-medium'}
                      leading-relaxed px-4
                    `}
                  >
                    {line || '\u00A0'}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <Music className="w-16 h-16 mx-auto mb-4 opacity-10" />
              <p className="font-medium italic">Lyrics are being gathered by our little elves...</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-primary/5">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 font-bold shadow-lg shadow-primary/10"
          >
            Done Stretching the Vocal Cords
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
