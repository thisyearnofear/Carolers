import { Link, useLocation } from 'wouter';
import { Music, Mic2, Trophy, Menu, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import logoImg from '@assets/generated_images/carolquest_app_icon.png';

export function Nav() {
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/">
          <a className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 overflow-hidden rounded-full shadow-lg transition-transform group-hover:scale-110">
              <img src={logoImg} alt="CarolQuest" className="w-full h-full object-cover" />
            </div>
            <span className="font-display text-2xl text-primary font-bold tracking-wide">CarolQuest</span>
          </a>
        </Link>

        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 bg-secondary/10 px-3 py-1 rounded-full">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="font-bold text-secondary text-sm">150 pts</span>
            </div>
            
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Bell className="w-5 h-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
            </Button>
        </div>
      </div>
    </nav>
  );
}
