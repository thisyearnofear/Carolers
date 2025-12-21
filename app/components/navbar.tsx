'use client';

import { SignInButton, SignOutButton, UserButton } from '@clerk/nextjs';
import { Music, House, BookOpen, Star, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';

import { useSafeUser } from '@/hooks/use-safe-user';

export function Navbar() {
    const { isSignedIn, user, isClerkDisabled } = useSafeUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-primary/5">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden group-hover:scale-110 transition-transform shadow-sm border border-primary/10">
                        <Image src="/carolers.jpeg" alt="Carolers" width={40} height={40} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-display text-xl md:text-2xl text-primary drop-shadow-sm">Carolers</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors flex items-center gap-2">
                        <House className="w-4 h-4" />
                        Home
                    </Link>
                    <Link href="/songs" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Songbook
                    </Link>
                    {!isClerkDisabled && <div className="h-6 w-px bg-primary/10 mx-2" />}
                    <div className="flex items-center">
                        {!isClerkDisabled && (
                            isSignedIn ? (
                                <UserButton
                                    afterSignOutUrl="/"
                                    appearance={{
                                        elements: {
                                            userButtonAvatarBox: "w-9 h-9 border-2 border-primary/20 hover:border-primary/50 transition-colors"
                                        }
                                    }}
                                />
                            ) : (
                                <SignInButton mode="modal">
                                    <Button variant="ghost" className="text-sm font-bold text-primary hover:bg-primary/5 rounded-xl">
                                        Sign In
                                    </Button>
                                </SignInButton>
                            )
                        )}
                        {isClerkDisabled && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 border border-slate-200 rounded-lg py-1">Guest Mode</span>
                        )}
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-primary"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden bg-white border-b border-primary/5 overflow-hidden shadow-xl"
                    >
                        <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
                            <Link
                                href="/"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-primary/5 transition-colors text-slate-700 font-bold"
                            >
                                <House className="w-5 h-5 text-primary" />
                                Home
                            </Link>
                            <Link
                                href="/songs"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-primary/5 transition-colors text-slate-700 font-bold"
                            >
                                <BookOpen className="w-5 h-5 text-primary" />
                                Songbook
                            </Link>
                            <div className="h-px bg-primary/5 w-full my-2" />
                            <div className="px-3">
                                {!isClerkDisabled && (
                                    isSignedIn ? (
                                        <div className="flex items-center gap-4 py-2">
                                            <UserButton afterSignOutUrl="/" />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{user?.fullName}</span>
                                                <span className="text-xs text-slate-500">{user?.primaryEmailAddress?.emailAddress}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <SignInButton mode="modal">
                                            <Button className="w-full bg-primary text-white rounded-2xl h-12 font-bold shadow-lg shadow-primary/10">
                                                Sign In
                                            </Button>
                                        </SignInButton>
                                    )
                                )}
                                {isClerkDisabled && (
                                    <div className="py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 rounded-xl">
                                        Guest Mode
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
