// MODULAR: Celebration animations and feedback system
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Heart, Star, Music, PartyPopper } from 'lucide-react';

// CLEAN: Celebration types
type CelebrationType = 'vote' | 'favorite' | 'event_start' | 'success' | 'song_added';

interface CelebrationProps {
  type: CelebrationType;
  message: string;
  duration?: number;
  onComplete?: () => void;
}

export function Celebration({ type, message, duration = 3000, onComplete }: CelebrationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  // ENHANCEMENT FIRST: Celebration configurations
  const celebrations = {
    vote: {
      icon: <Check className="w-8 h-8 text-green-500" />,
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
      particles: '🎵',
    },
    favorite: {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
      particles: '❤️',
    },
    event_start: {
      icon: <PartyPopper className="w-8 h-8 text-blue-500" />,
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-800',
      particles: '🎉',
    },
    success: {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-800',
      particles: '✨',
    },
    song_added: {
      icon: <Music className="w-8 h-8 text-purple-500" />,
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-800',
      particles: '🎶',
    },
  };

  const config = celebrations[type];

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 ${config.color} rounded-xl p-4 shadow-lg max-w-sm mx-auto`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        <div className="flex-1">
          <p className={`font-semibold ${config.textColor}`}>{message}</p>
        </div>
        <div className="text-2xl">{config.particles}</div>
      </div>
      
      {/* Floating particles */}
      <AnimatePresence>
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              y: -50,
              x: Math.random() * 100 - 50,
            }}
            transition={{ 
              duration: 2,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
            className="absolute text-xl"
          >
            {config.particles}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// MODULAR: Celebration context for global use
export function useCelebration() {
  const [celebrations, setCelebrations] = useState<CelebrationProps[]>([]);

  const triggerCelebration = (props: CelebrationProps) => {
    setCelebrations(prev => [...prev, props]);
    
    // Auto-remove after duration
    setTimeout(() => {
      setCelebrations(prev => prev.filter(c => c !== props));
    }, props.duration || 3000);
  };

  const CelebrationContainer = () => (
    <>
      {celebrations.map((celebration, index) => (
        <Celebration key={index} {...celebration} />
      ))}
    </>
  );

  return { triggerCelebration, CelebrationContainer };
}

// CLEAN: Predefined celebration triggers
export const celebrationTriggers = {
  voteSuccess: () => ({
    type: 'vote' as CelebrationType,
    message: 'Vote recorded! 🎵',
    duration: 2500,
  }),
  
  songFavorite: () => ({
    type: 'favorite' as CelebrationType,
    message: 'This carol is a crowd favorite! ❤️',
    duration: 3000,
  }),
  
  eventStarting: (minutes: number) => ({
    type: 'event_start' as CelebrationType,
    message: `Event starts in ${minutes} minutes! Get ready! 🎉`,
    duration: 4000,
  }),
  
  songAdded: () => ({
    type: 'song_added' as CelebrationType,
    message: 'New song added to your event! 🎶',
    duration: 2500,
  }),
  
  actionSuccess: (message: string) => ({
    type: 'success' as CelebrationType,
    message,
    duration: 2000,
  }),
};