import './globals.css';
import type { Metadata } from 'next';
import { Berkshire_Swash, Lato } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';

import { QueryProvider } from '@/providers/query-provider';
import { Toaster } from './components/ui/toaster';

const displayFont = Berkshire_Swash({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display'
});

const sansFont = Lato({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-sans'
});

import { Navbar } from './components/navbar';

export const metadata: Metadata = {
  title: 'Carolers | Join the Festive Chorus 🎄',
  description: 'Connect with caroling groups, vote on your favorite festive songs, and celebrate the season together.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'Carolers | Join the Festive Chorus 🎄',
    description: 'Connect with caroling groups, vote on your favorite festive songs, and celebrate the season together.',
    type: 'website',
    images: [{ url: '/carolersbanner.png', width: 1200, height: 630, alt: 'Carolers banner' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carolers | Join the Festive Chorus 🎄',
    description: 'Connect with caroling groups, vote on your favorite festive songs, and celebrate the season together.',
    images: ['/carolersbanner.png'],
  }
};

function HtmlShell({ children, withClerk }: { children: React.ReactNode; withClerk: boolean }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${sansFont.variable}`}>
      <head />
      <body className="font-sans antialiased">
        <QueryProvider>
          {withClerk ? (
            <Navbar />
          ) : (
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-primary/5">
              <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <a href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <span className="font-bold">🎄</span>
                  </div>
                  <span className="font-display text-xl md:text-2xl text-primary">Carolers</span>
                </a>
                <div className="hidden md:flex items-center gap-8">
                  <a href="/" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Home</a>
                  <a href="/songs" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Songbook</a>
                </div>
              </div>
            </nav>
          )}
          <main id="main-content" className="pt-16 min-h-screen" role="main">
            {children}
          </main>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasClerk = !!publishableKey;

  if (!hasClerk && typeof window === 'undefined') {
    console.warn('⚠️ Clerk Publishable Key is missing. Carolers is running in Guest Mode. To enable auth, add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env');
  }

  if (hasClerk) {
    return (
      <ClerkProvider publishableKey={publishableKey}>
        <HtmlShell withClerk>{children}</HtmlShell>
      </ClerkProvider>
    );
  }

  return <HtmlShell withClerk={false}>{children}</HtmlShell>;
}