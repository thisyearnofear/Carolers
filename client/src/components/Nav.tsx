import { Link, useLocation } from 'wouter';
import { Trophy, Menu } from 'lucide-react';
import { Button } from './ui/button';

export function Nav() {
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/">
          <a className="flex items-center gap-2 group">
            <span className="font-display text-3xl font-bold text-primary tracking-wider">Carolers</span>
          </a>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-secondary/10 px-3 py-1 rounded-full">
            <Trophy className="w-4 h-4 text-accent" />
            <span className="font-bold text-secondary text-sm">150 pts</span>
          </div>
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
