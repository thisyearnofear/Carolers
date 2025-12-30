'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateEventModal } from './components/modals/create-event-modal';
import { JoinEventModal } from './components/modals/join-event-modal';
import { Button } from './components/ui/button';
import Link from 'next/link';
import {
  Plus,
  Users,
  Sparkles,
  Music,
  Heart,
  Calendar,
  Snowflake,
  BookOpen,
  Search
} from 'lucide-react';
import { OnboardingModal, useOnboarding } from './components/onboarding/onboarding-modal';
import { useEffect } from 'react';
import { Badge } from './components/ui/badge';

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

  useEffect(() => {
    const handleOpenCreate = () => setShowCreateModal(true);
    document.addEventListener('openCreateEvent', handleOpenCreate);
    return () => document.removeEventListener('openCreateEvent', handleOpenCreate);
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-50 via-white to-green-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950/20 py-8 overflow-hidden">
      <div className="container mx-auto px-6 relative z-10 pt-8">
        <header className="mb-16 text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-7xl font-display text-primary drop-shadow-sm leading-tight mb-6">
              Celebrate the Season <br className="hidden md:block" /> Through Song
            </h2>
            <p className="text-xl text-slate-600 font-medium mb-10 leading-relaxed px-4">
              Whether you're hosting a neighborhood gathering or learning carols for a solo performance, find the joy and lyrics for every festive occasion.
            </p>
          </motion.div>

          <div className="w-full max-w-lg mx-auto mb-10 group">
            <Link href="/songs" className="block relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
              <div className="w-full h-14 pl-12 pr-4 bg-white/80 backdrop-blur-xl border border-primary/10 rounded-2xl flex items-center text-slate-400 text-lg shadow-xl shadow-primary/5 group-hover:border-primary/30 transition-all">
                Search 100+ carols, traditions, or artists...
              </div>
            </Link>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pt-1 mr-2">Try:</span>
              {['Relaxing', 'Upbeat', 'Traditional', 'Religious'].map((mood) => (
                <Link key={mood} href={`/songs?mood=${mood}`}>
                  <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 cursor-pointer border-none px-3 py-1 text-[10px] uppercase font-bold tracking-tight">
                    {mood}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/songs" className="w-full sm:w-auto">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 px-8 h-14 text-lg rounded-2xl flex items-center justify-center gap-2"
              >
                <BookOpen className="w-6 h-6" />
                Explore Songbook
              </Button>
            </Link>

            <div className="flex gap-4 w-full sm:w-auto">
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="outline"
                className="flex-1 sm:px-6 h-14 text-base rounded-2xl border-primary/20 text-primary hover:bg-primary/5 bg-white/50 backdrop-blur-sm shadow-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Host session
              </Button>
              <Button
                onClick={() => setShowJoinModal(true)}
                variant="outline"
                className="flex-1 sm:px-6 h-14 text-base rounded-2xl border-primary/20 text-primary hover:bg-primary/5 bg-white/50 backdrop-blur-sm shadow-sm flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                Join
              </Button>
            </div>
          </motion.div>
        </header>

        <motion.div
          className="mb-8 flex items-center gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex -space-x-3 overflow-hidden p-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center overflow-hidden border border-primary/10`}>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Connecting <span className="text-primary">1,200+</span> carolers this week
          </p>
        </motion.div>

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
