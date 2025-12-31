'use client';

import { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { Volume2, VolumeX, Play, Pause, TreePine } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

export function ChristmasAmbiance() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3); // Default to 30% volume for ambiance
  const [isReady, setIsReady] = useState(false);

  const soundRef = useRef<Howl | null>(null);
  const isInitialized = useRef(false); // Prevent multiple initializations

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Initialize the Howl instance
    const sound = new Howl({
      src: ['/music/OnaE.mp3'],
      loop: true, // Loop the ambiance music
      volume: volume,
      onload: () => {
        setIsReady(true);
      },
      onplay: () => {
        setIsPlaying(true);
      },
      onpause: () => {
        setIsPlaying(false);
      },
      onstop: () => {
        setIsPlaying(false);
      },
      onloaderror: (id, err) => {
        console.error('Error loading ambiance music:', err);
      },
      onplayerror: (id, err) => {
        console.error('Error playing ambiance music:', err);
        // Try to play again after a short delay
        setTimeout(() => {
          if (soundRef.current?.state() === 'unloaded') return;
          soundRef.current?.play();
        }, 100);
      }
    });

    soundRef.current = sound;

    // Clean up on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
        soundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.mute(isMuted);
    }
  }, [isMuted]);

  const togglePlay = () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (soundRef.current) {
      soundRef.current.volume(newVolume);
    }
  };

  // Auto-play when ready (with user interaction requirement in mind)
  useEffect(() => {
    if (isReady && !isPlaying) {
      // Try to play automatically, but this might be blocked by browser autoplay policies
      // So we'll show the player and let users control it
      const playAttempt = () => {
        if (soundRef.current && !isPlaying) {
          soundRef.current.play();
        }
      };

      // Try to play on first user interaction
      const handleFirstInteraction = () => {
        playAttempt();
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      };

      document.addEventListener('click', handleFirstInteraction);
      document.addEventListener('touchstart', handleFirstInteraction);
      document.addEventListener('keydown', handleFirstInteraction);

      return () => {
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      };
    }
  }, [isReady, isPlaying]);

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg p-3 border border-primary/20 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-primary/10"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause ambiance' : 'Play ambiance'}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 text-primary" />
          ) : (
            <Play className="h-5 w-5 text-primary" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-primary/10"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute ambiance' : 'Mute ambiance'}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-primary" />
          ) : (
            <Volume2 className="h-5 w-5 text-primary" />
          )}
        </Button>

        <div className="flex items-center gap-2 w-24">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-primary/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            aria-label="Volume control"
          />
        </div>

        <div className="ml-1">
          <TreePine className="h-5 w-5 text-green-600" />
        </div>
      </div>
    </div>
  );
}