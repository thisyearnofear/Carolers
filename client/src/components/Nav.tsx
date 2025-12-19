import { Link, useLocation } from 'react-router-dom';
import { Trophy, Menu, LogIn } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import { Button } from './ui/button';
import { useAppUser } from '@/lib/auth';
import { motion } from 'framer-motion';

export function Nav() {
  const [location] = useLocation();
  const { user, isLoading } = useAppUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-display text-2xl md:text-3xl font-bold text-primary tracking-wider">
              Carol<span className="text-red-600">Quest</span>
            </span>
          </Link>
        </motion.div>

        <div className="flex items-center gap-4">
          {/* ENHANCEMENT FIRST: Show points only for authenticated users */}
          {user && (
            <motion.div 
              className="hidden md:flex items-center gap-2 bg-secondary/10 px-3 py-1 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Trophy className="w-4 h-4 text-accent" />
              <span className="font-bold text-secondary text-sm">150 pts</span>
            </motion.div>
          )}
          
          {/* CLEAN: Consolidated auth UI */}
          {isLoading ? (
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          ) : user ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  }
                }}
              />
            </motion.div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <SignInButton mode="modal">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button variant="ghost" size="sm" className="gap-2 text-green-700 hover:text-green-800">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                </motion.div>
              </SignInButton>
              
              <SignUpButton mode="modal">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    Sign Up
                  </Button>
                </motion.div>
              </SignUpButton>
            </div>
          )}
          
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
