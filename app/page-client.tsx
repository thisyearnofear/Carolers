'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateEventModal } from './components/modals/create-event-modal';
import { JoinEventModal } from './components/modals/join-event-modal';
import { Button } from './components/ui/button';
import {
  Plus,
  Users,
  Sparkles,
  Music,
  Heart,
  Calendar,
  Snowflake
} from 'lucide-react';
import { OnboardingModal, useOnboarding } from './components/onboarding/onboarding-modal';
import { useEffect } from 'react';

interface PageClientProps {
  children: React.ReactNode;
}

export function PageClient({ children }: PageClientProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { shouldShow } = useOnboarding();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (shouldShow) {
      const timer = setTimeout(() => setShowOnboarding(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-50 via-white to-green-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950/20 py-8 overflow-hidden">
      {/* Decorative Snowflakes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 dark:opacity-10">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-primary"
            initial={{ y: -20, x: Math.random() * 100 + '%' }}
            animate={{
              y: '110vh',
              x: (Math.random() * 100) + (Math.sin(i) * 10) + '%'
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 20
            }}
          >
            <Snowflake size={12 + Math.random() * 24} />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <header className="mb-16 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              <span>The world's first caroling community</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-display text-primary mb-6 drop-shadow-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Carolers
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-secondary-foreground/80 mb-10 font-sans max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Join the festive chorus. Create events, vote on songs, and capture memories of singing together—wherever you celebrate.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 px-8 py-6 text-lg rounded-2xl"
              size="lg"
            >
              <Plus className="w-6 h-6 mr-2" />
              Create Event
            </Button>
            <Button
              onClick={() => setShowJoinModal(true)}
              variant="outline"
              className="border-secondary text-secondary hover:bg-secondary/10 px-8 py-6 text-lg rounded-2xl bg-white/50 backdrop-blur-sm"
              size="lg"
            >
              <Users className="w-6 h-6 mr-2" />
              Join Existing
            </Button>
          </motion.div>
        </header>

        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          <div className="flex items-center justify-between mb-8 border-b border-primary/10 pb-4">
            <div>
              <h2 className="text-3xl font-display text-secondary">Upcoming Events</h2>
              <p className="text-muted-foreground">Nearby groups ready to spread joy</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {children}
          </div>
        </motion.div>

        {/* Multicultural Promo */}
        <motion.div
          className="mt-20 relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-secondary/90 to-emerald-900 p-8 md:p-16 text-white shadow-2xl"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Music className="w-64 h-64 -rotate-12" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <h3 className="text-4xl font-display mb-6">Celebrate Every Tradition</h3>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              From classic Christmas carols and Hanukkah melodies to Easter hymns and seasonal ballads across all cultures—Carolers brings us together through the universal language of song.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md">
                <Heart className="w-5 h-5 text-red-400 fill-red-400" />
                <span>Inclusive Community</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md">
                <Music className="w-5 h-5 text-yellow-400" />
                <span>Global Songbook</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Join Millions</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <CreateEventModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
      <JoinEventModal
        open={showJoinModal}
        onOpenChange={setShowJoinModal}
      />

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingModal onClose={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
