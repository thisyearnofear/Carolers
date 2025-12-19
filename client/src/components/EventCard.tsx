import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Countdown } from './Countdown';
import { type Event } from '@/store/useStore';
import { useLocation } from 'wouter';

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

const THEME_COLORS: Record<string, { bg: string; accent: string; border: string }> = {
  'Christmas': { bg: 'from-red-600 to-green-700', accent: 'from-yellow-400 to-amber-500', border: 'border-red-500/30' },
  'Hanukkah': { bg: 'from-blue-700 to-indigo-900', accent: 'from-yellow-300 to-orange-400', border: 'border-blue-500/30' },
  'Easter': { bg: 'from-purple-600 to-pink-500', accent: 'from-yellow-200 to-pink-300', border: 'border-pink-500/30' },
  'New Year': { bg: 'from-slate-800 to-slate-900', accent: 'from-yellow-300 to-amber-400', border: 'border-slate-600/30' }
};

export function EventCard({ event, onClick }: EventCardProps) {
  const [, setLocation] = useLocation();
  const colors = THEME_COLORS[event.theme] || THEME_COLORS['Christmas'];

  const handleClick = () => {
    onClick?.();
    setLocation(`/room/${event.id}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
    >
      <Card className={`group relative overflow-hidden cursor-pointer border ${colors.border} bg-gradient-to-br ${colors.bg} text-white shadow-xl hover:shadow-2xl transition-all`}>
        <div className="p-6 relative">
          {/* Decorative accent */}
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${colors.accent} opacity-10 rounded-full blur-3xl transform translate-x-8 -translate-y-8`} />
          
          <div className="relative z-10 space-y-4">
            {/* Header */}
            <div>
              <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                {event.theme}
              </div>
              <h3 className="font-display text-2xl font-bold leading-tight">{event.name}</h3>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-white/80">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              {event.venue && (
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{event.venue}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-white/80">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span>{event.members.length} joining</span>
              </div>
            </div>

            {/* Countdown */}
            <div className="pt-2">
              <Countdown targetDate={event.date} label="Starts in" />
            </div>

            {/* Footer */}
            <div className="pt-2 flex items-center justify-between">
              <p className="text-xs text-white/70">{event.description}</p>
              <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
