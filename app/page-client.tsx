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

      <div className="container mx-auto px-6 relative z-10">
        <header className="mb-12 text-center max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/5">
              <Music className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-display text-primary drop-shadow-sm leading-tight">
              Carolers
            </h1>
          </motion.div>

          <motion.p
            className="text-lg text-slate-800 font-medium mb-8 leading-relaxed px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Experience the magic of caroling. Prepare your songs, sing in harmony, and capture the memories together.
          </motion.p>

          <motion.div
            className="flex gap-3 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-6 py-5 text-base rounded-xl flex-1 max-w-[160px]"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create
            </Button>
            <Button
              onClick={() => setShowJoinModal(true)}
              variant="outline"
              className="border-primary/20 text-primary hover:bg-primary/5 px-6 py-5 text-base rounded-xl flex-1 max-w-[160px] bg-white/50 backdrop-blur-sm"
              size="lg"
            >
              <Users className="w-5 h-5 mr-2" />
              Join
            </Button>
          </motion.div>
        </header>

        <motion.div
          className="mb-12 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          <div className="flex items-center justify-center mb-8 pb-4">
            <div className="h-px bg-primary/10 flex-1" />
            <h2 className="mx-4 text-xl font-display text-secondary font-bold uppercase tracking-wider">Active Sessions</h2>
            <div className="h-px bg-primary/10 flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 place-items-center">
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
