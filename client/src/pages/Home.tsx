import { useStore } from '@/store/useStore';
import { Nav } from '@/components/Nav';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, Users } from 'lucide-react';
import bgTexture from '@assets/generated_images/subtle_festive_snowflake_background_texture.png';

export default function Home() {
  const events = useStore(state => state.events);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Texture */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none mix-blend-multiply"
        style={{ backgroundImage: `url(${bgTexture})`, backgroundSize: 'cover' }}
      />

      <Nav />
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-block bg-accent/20 border border-accent/40 px-4 py-2 rounded-full mb-6">
            <span className="font-bold text-accent text-sm uppercase tracking-widest">Sing Together, Celebrate Always</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-display text-primary font-bold mb-4 leading-tight">
            Gather Your Singers
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            Create events, vote on songs, coordinate contributions, and capture memories of singing together—wherever you celebrate.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5" />
              Create Event
            </Button>
            <Button size="lg" variant="secondary" className="gap-2">
              <Users className="w-5 h-5" />
              Join Existing
            </Button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-display text-secondary font-bold">Your Events</h2>
              <p className="text-muted-foreground mt-1">Join your community and celebrate together</p>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16 px-8 border-2 border-dashed border-muted rounded-2xl bg-white/20">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No events yet. Create your first gathering!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>

        {/* Multicultural Promo */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
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
        </div>
      </main>
    </div>
  );
}
