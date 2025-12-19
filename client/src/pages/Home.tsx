import { useStore } from '@/store/useStore';
import { Nav } from '@/components/Nav';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, Users, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreateEventModal } from '@/components/CreateEventModal';
import { JoinEventModal } from '@/components/JoinEventModal';
import { PageTransition } from '@/components/ui/PageTransition';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { useState } from 'react';
import bgTexture from '@assets/generated_images/subtle_festive_snowflake_background_texture.png';

export default function Home() {
  const events = useStore(state => state.events);
  const setCurrentEvent = useStore(state => state.setCurrentEvent);
  const navigate = useNavigate();
  
  // CLEAN: Modal state management
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative">
        {/* Background Texture */}
        <motion.div 
          className="absolute inset-0 opacity-30 pointer-events-none mix-blend-multiply"
          style={{ backgroundImage: `url(${bgTexture})`, backgroundSize: 'cover' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.2 }}
        />

        <Nav />
        
        <main className="container mx-auto px-4 py-12 relative z-10">
          {/* Hero Section */}
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
          <motion.div 
            className="inline-block bg-accent/20 border border-accent/40 px-4 py-2 rounded-full mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <span className="font-bold text-accent text-sm uppercase tracking-widest">Sing Together, Celebrate Always</span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-6xl font-display text-primary font-bold mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            Gather Your Singers
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Create events, vote on songs, coordinate contributions, and capture memories of singing together—wherever you celebrate.
          </motion.p>

          <motion.div 
            className="flex gap-4 justify-center flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button 
                onClick={() => setShowCreateModal(true)}
                size="lg" 
                className="gap-2 shadow-lg shadow-primary/20"
              >
                <Plus className="w-5 h-5" />
                Create Event
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button 
                onClick={() => setShowJoinModal(true)}
                size="lg" 
                variant="secondary" 
                className="gap-2"
              >
                <Users className="w-5 h-5" />
                Join Existing
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          <motion.div 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-display text-secondary font-bold">Your Events</h2>
              <p className="text-muted-foreground mt-1">Join your community and celebrate together</p>
            </div>
          </motion.div>

          {events.length === 0 ? (
            <div className="text-center py-16 px-8 border-2 border-dashed border-muted rounded-2xl bg-white/20">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No events yet. Create your first gathering!</p>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 1.1 + (index * 0.1),
                    ease: [0.25, 0.25, 0, 1]
                  }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Multicultural Promo */}
        <motion.div 
          className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <Sparkles className="w-64 h-64" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <h3 className="font-display text-3xl md:text-4xl font-bold mb-3">Celebrate Any Tradition</h3>
            <p className="text-lg text-white/90 mb-6">
              Christmas carols, Hanukkah songs, Easter hymns, holiday ballads from every culture—Carolers brings the world together through music.
            </p>
            <div className="flex gap-4">
              <Button variant="secondary" className="font-bold">
                Browse Multicultural Songs
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* MODULAR: Modal components */}
      <CreateEventModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      
      <JoinEventModal 
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinSuccess={(eventId) => {
          setCurrentEvent(eventId);
          navigate(`/events/${eventId}`);
        }}
      />
    </div>
    </PageTransition>
  );
}
