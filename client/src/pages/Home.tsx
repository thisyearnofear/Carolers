import { useStore } from '@/store/useStore';
import { Nav } from '@/components/Nav';
import { CarolCard } from '@/components/CarolCard';
import { PlaylistBuilder } from '@/components/PlaylistBuilder';
import { Input } from '@/components/ui/input';
import { Search, Filter, Sparkles, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import bgTexture from '@assets/generated_images/subtle_festive_snowflake_background_texture.png';

export default function Home() {
  const carols = useStore(state => state.carols);

  return (
    <div className="min-h-screen bg-background relative">
       {/* Background Texture */}
       <div 
         className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply"
         style={{ backgroundImage: `url(${bgTexture})`, backgroundSize: 'cover' }}
       />

      <Nav />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
            
            {/* Library Section */}
            <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl md:text-5xl font-display text-primary drop-shadow-sm">Carol Library</h1>
                    <p className="text-muted-foreground text-lg">Discover and curate your festive favorites.</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input placeholder="Search songs, artists, tags..." className="pl-10 h-12 text-lg bg-white/70 backdrop-blur-sm border-primary/20 focus-visible:ring-primary" />
                    </div>
                    <Button variant="outline" className="h-12 w-12 shrink-0 border-primary/20">
                        <Filter className="w-4 h-4 text-primary" />
                    </Button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['All', 'Upbeat', 'Traditional', 'Choral', 'Jazz', 'Kids'].map(tag => (
                        <Button 
                            key={tag} 
                            variant={tag === 'All' ? 'default' : 'secondary'} 
                            className="rounded-full px-6"
                        >
                            {tag}
                        </Button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 pb-20">
                    {carols.map(carol => (
                        <CarolCard key={carol.id} carol={carol} />
                    ))}
                    
                    {/* Promo Card */}
                    <div className="md:col-span-2 mt-4 p-6 bg-gradient-to-r from-accent to-orange-400 rounded-xl text-white shadow-lg relative overflow-hidden group cursor-pointer">
                        <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                            <Sparkles className="w-48 h-48" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="font-display text-2xl mb-2">Host a Carol Party?</h3>
                            <p className="opacity-90 max-w-md mb-4">Start a multiplayer session and invite friends to sing along with real-time gamification.</p>
                            <Button variant="secondary" className="text-accent-foreground font-bold">Create Room</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Playlist Sidebar */}
            <div className="hidden lg:block lg:col-span-5 h-full sticky top-24">
                <PlaylistBuilder />
            </div>

             {/* Mobile Fab for Playlist */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
                <Button size="lg" className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90">
                    <Music2 className="w-6 h-6" />
                </Button>
            </div>
        </div>
      </main>
    </div>
  );
}
